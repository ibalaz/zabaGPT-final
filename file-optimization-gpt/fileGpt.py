from urllib.parse import quote
import hashlib
import sqlite3
import openai
import requests
from flask import Flask, request, jsonify
from flask_cors import CORS

# Set the GitLab project URL and API token
api_token = 'glpat-S1cAUFXxzoK4qNgRsnag'
openai.api_key = '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'
git_lab_at = "glpat-aHvrnFvQUCbQym2_7ayM"

headers = {"PRIVATE-TOKEN": git_lab_at}

app = Flask(__name__, static_url_path='/static')
CORS(app)
project_id = ''

conn = sqlite3.connect('kv_store.db')  # Connect to the SQLite database (it will be created if it doesn't exist)
cursor = conn.cursor()
# Create a table named kv_store with key and value columns if it does not exist yet...
cursor.execute('''
    CREATE TABLE IF NOT EXISTS kv_store(
        key TEXT UNIQUE,
        value TEXT
    );
''')
conn.commit()  # Commit the changes
conn.close()  # Close the connection


# A function to insert a key-value pair into the kv_store table...
def put_cache_value(key, value):
    # Connect to the SQLite database (it will be created if it doesn't exist)
    conn2 = sqlite3.connect('kv_store.db')
    cursor2 = conn2.cursor()
    try:
        cursor2.execute('''INSERT INTO kv_store(key, value) VALUES(?, ?)''', (key, value))
        conn2.commit()  # Commit the changes
        conn2.close()  # Close the connection
    except sqlite3.IntegrityError:
        print(f"Key {key} already exists.")


# A function to retrieve a value by key from the kv_store table
def get_cache_value(key):
    # Connect to the SQLite database (it will be created if it doesn't exist)
    conn2 = sqlite3.connect('kv_store.db')
    cursor2 = conn2.cursor()
    cursor2.execute('''SELECT value FROM kv_store WHERE key = ?''', (key,))
    result = cursor2.fetchone()
    conn2.close()  # Close the connection

    return result[0] if result else None


def hash_input(for_hash):
    # Create a SHA256 hash object
    sha256_hash = hashlib.sha256()

    # Update the hash object with the string to be hashed
    sha256_hash.update(for_hash.encode('utf-8'))

    return sha256_hash.hexdigest()  # Get the hexadecimal representation of the hashed value


def chat_gpt_cached_answer(chat_prompt):
    chat_gpt_model = "gpt-3.5-turbo"
    chat_prompt_hash = hash_input(chat_gpt_model + "|" + chat_prompt)
    print(f"Hash of {chat_gpt_model}|" + chat_prompt[0:30] + f"... je {chat_prompt_hash}")

    result = get_cache_value(chat_prompt_hash)
    if result is None:
        response = openai.ChatCompletion.create(
            model=chat_gpt_model,
            messages=[
                {"role": "user", "content": chat_prompt}
            ]
        )

        result = response['choices'][0]['message']['content']
        put_cache_value(chat_prompt_hash, result)
        return result
    else:
        return result


# Extract the project path from any GitLab URL...
def extract_project_path(url):
    project_path_start = url.find("gitlab.com/") + 11
    if url.find("/-/", project_path_start) == -1:
        project_path_with_namespace = quote(url[project_path_start:]).replace("/activity", "")
    else:
        project_path_end = url.find("/-/", project_path_start)
        project_path_with_namespace = quote(url[project_path_start:project_path_end])

    return project_path_with_namespace.replace("/", "%2F")


def get_files_recursive(path=''):
    endpoint = f"https://gitlab.com/api/v4/projects/{project_id}/repository/tree"

    params = {}
    if path:
        params['path'] = path

    response = requests.get(endpoint, headers=headers, params=params)
    response.raise_for_status()

    files = []
    for item in response.json():
        if item['type'] == 'tree':  # this is a directory
            files.extend(get_files_recursive(item['path']))
        else:  # this is a file
            files.append(item)

    return files


@app.route('/files', methods=['GET', 'POST'])
def get_files():
    global project_id
    files_response = []

    project_url = request.json.get('url')
    print('Project url: ', project_url)

    project_path = extract_project_path(project_url)
    print('Project path: ', project_path)

    api_url_get_project_id = f"https://gitlab.com/api/v4/projects/{project_path}"
    print("API_URL_GetProjectID = " + api_url_get_project_id)

    response_project_id = requests.get(api_url_get_project_id, headers=headers)

    if response_project_id.status_code == 200:
        project_id = response_project_id.json()["id"]
    else:
        print('Error getting project information')
        return jsonify(success=False, messae='Error getting project information')

    print('Project id: ', project_id)

    files = get_files_recursive()
    for file in files:
        files_response.append({'label': file["name"], 'value': file["path"]})
    print("Files response: ", files_response)

    return jsonify(success=True, files=files_response)


@app.route('/gpt_endpoint', methods=['GET', 'POST'])
def gpt_endpoint():
    global project_id
    value = request.json.get('value')
    print('Value: ', value)

    endpoint = f'https://gitlab.com/api/v4/projects/{project_id}/repository/files/{value}/raw'
    print('Endpoint: ', endpoint)

    response = requests.get(endpoint, headers=headers)
    print("Response raw file: ", response.content)
    output_text = ''

    prompt = 'Optimize this code: \n' + '\n'.join(str(response.content))

    output_text += chat_gpt_cached_answer(prompt)
    print('Output: ', output_text)

    return jsonify(success=True, output_text=output_text, prompt=prompt)


if __name__ == '__main__':
    app.run(debug=True, port=5002)
