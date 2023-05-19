import hashlib
import sqlite3
import openai
import requests
from flask import Flask, request, jsonify
from flask_cors import CORS

# Set the GitLab project URL and API token
api_token = 'glpat-S1cAUFXxzoK4qNgRsnag'
openai.api_key = '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'

headers = {
    'Authorization': f'Bearer {api_token}'
}

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


def extract_project_path(url):
    # Remove the protocol (http:// or https://) from the URL
    url = url.replace('http://', '').replace('https://', '')

    # Find the index of the first occurrence of '/'
    first_slash_index = url.index('/')

    # Find the index of the second occurrence of '/'
    second_slash_index = url.index('/', first_slash_index + 1)

    # Extract the project path
    project_path = url[second_slash_index + 1:]

    return project_path


def extract_added_lines(diff):
    # Split diff into lines
    diff_lines = diff.split('\n')

    # Keep only added lines
    added_lines = [line for line in diff_lines if line.startswith('+')]

    # Exclude lines that start with '+++'
    added_lines = [line[1:] for line in added_lines if not line.startswith('+++')]

    return added_lines


@app.route('/commits', methods=['GET', 'POST'])
def get_commits():
    global project_id
    commit_links = []

    project_url = request.json.get('url')
    print('Project url: ', project_url)

    project_path = extract_project_path(project_url)
    print('Project path: ', project_path)

    url = f'https://gitlab.com/api/v4/projects?search={project_path}'
    response_project_id = requests.get(url, headers=headers)

    if response_project_id.status_code == 200:
        projects = response_project_id.json()
        if len(projects) > 0:
            project_id = projects[0]['id']
        else:
            print('No project found with specified path.')
            return jsonify(success=False, message='No project found with specified path.')

    else:
        print('Error getting project information')
        return jsonify(success=False, message='Error getting project information')

    print('Project id: ', project_id)

    # Set the GitLab API endpoint for merge requests
    endpoint = f'https://gitlab.com/api/v4/projects/{project_id}/repository/commits'

    # Send a GET request to the API endpoint
    response = requests.get(endpoint, headers=headers)
    print('Response: ', response)

    # Check if the request was successful
    if response.status_code == 200:
        # Get the JSON data from the response
        commits = response.json()

        # Print the merge request information
        for com in commits:
            commit_links.append({'label': com["title"], 'value': com["id"]})
        print('Commits: ', commit_links)
    else:
        print('Failed to retrieve commits.')
        return jsonify(success=False, message='Failed to retrieve commits from gitlab.')

    return jsonify(success=True, commits=commit_links)


@app.route('/gpt_endpoint', methods=['GET', 'POST'])
def gpt_endpoint():
    value = request.json.get('value')
    print('Value: ', value)

    # Set the GitLab API endpoint for merge requests
    endpoint = f'https://gitlab.com/api/v4/projects/{project_id}/repository/commits/{value}/diff'
    print('Endpoint: ', endpoint)

    # Send a GET request to the API endpoint
    response = requests.get(endpoint, headers=headers)
    print('Response: ', response.json())
    output_text = ''
    prompt_codes = []

    for commit in response.json():
        added_lines = extract_added_lines(commit['diff'])
        print("Added lines: ", added_lines)
        prompt_code = '\n'.join(added_lines)
        prompt_codes.append(prompt_code)

    prompt = 'Optimize this code: \n' + '\n'.join(prompt_codes)

    output_text += chat_gpt_cached_answer(prompt)
    print('Output: ', output_text)

    return jsonify(success=True, output_text=output_text, added_lines=prompt)


if __name__ == '__main__':
    app.run(debug=True, port=5001)
