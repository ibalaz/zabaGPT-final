from urllib.parse import quote
import requests
import hashlib
from flask import Flask, jsonify, request
from flask_cors import CORS


app = Flask(__name__)
CORS(app)


@app.route('/process_mr_url', methods=['POST'])
def process_mr_url():
    url = request.json.get('mr_url')
    result = process_url(url)  # Call your Python function here

    return result


def hash_input(data):
    # Create a SHA256 hash object
    sha256_hash = hashlib.sha256()

    # Update the hash object with the string to be hashed
    sha256_hash.update(data.encode('utf-8'))

    return sha256_hash.hexdigest()  # Get the hexadecimal representation of the hashed value


def chat_gpt_cached_answer(chat_prompt):
    import openai

    openai.api_key = "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"  # os.environ.get("OPENAI_API_KEY")

    chat_prompt_hash = hash_input(chat_prompt)
    print(chat_prompt_hash)

    response = openai.ChatCompletion.create(
        model="gpt-3.5-turbo",
        messages=[
            {"role": "user", "content": chat_prompt}
        ]
    )

    return response['choices'][0]['message']['content']


def process_url(url):
    # take URL and extract MR ID from it, then call GitLab API...

    git_lab_at = "glpat-aHvrnFvQUCbQym2_7ayM"  # os.environ.get("GITLAB_ACCESS_TOKEN")

    # Extract the project ID...
    project_id_start = url.find("gitlab.com/") + 11
    project_id_end = url.find("/-/", project_id_start)

    project_path_with_namespace = quote(url[project_id_start:project_id_end]).replace("/", "%2F")

    api_url_get_project_id = f"https://gitlab.com/api/v4/projects/{project_path_with_namespace}"
    print("API_URL_GetProjectID = " + api_url_get_project_id)

    # Send GET request to GitLab API
    headers = {"PRIVATE-TOKEN": git_lab_at}
    response = requests.get(api_url_get_project_id, headers=headers)

    # Check response status code
    if response.status_code == 200:
        # Parse response JSON to access project ID
        project_id = response.json()["id"]
        # print(f"Project ID: {projectID}")
    else:
        project_id = -1
        print(response.json())

    # Extract the string after the last slash
    last_slash_index = url.rfind("/")
    if last_slash_index != -1:
        merge_request_id = url[last_slash_index + 1:]
    else:
        merge_request_id = ""

    # GitLab API endpoint for retrieving merge request changes
    api_url_get_mrc_hanges = f"https://gitlab.com/api/v4/projects/{project_id}/merge_requests/{merge_request_id}/changes"
    # print("API_URL_GetMRChanges = " + API_URL_GetMRCHanges)

    # Send GET request to GitLab API
    headers = {"PRIVATE-TOKEN": git_lab_at}
    response = requests.get(api_url_get_mrc_hanges, headers=headers)

    mr_changes_str = ""
    changelog_str = ""

    # Check response status code
    if response.status_code == 200:
        # Parse response JSON to access changes data
        mr_changes = response.json()["changes"]

        # Process and display the changes
        for change in mr_changes:
            new_path = change["new_path"]
            old_path = change["old_path"]
            diff = change["diff"]
            # print(f"Diff for {new_path}:\n{diff}")
            diff_length = str(len(diff))

            if len(diff) > 3000:
                lines = diff.splitlines()
                filtered_lines = [line for line in lines if not line.startswith("-")]

                diff4cl = ""
                for line in filtered_lines:
                    line_without_minus = line[1:]
                    diff4cl = diff4cl + f"{line_without_minus}\n"

                cl4diff = diff4cl[0:3000]
            else:
                cl4diff = diff

            cl4diff_length = str(len(cl4diff))
            mr_changes_str = mr_changes_str + f">>>>>>>>>>    DIFFERENCES FOR {new_path} ({diff_length} / {cl4diff_length})     <<<<<<<<<<\n\n{cl4diff}\n\n\n"

            open_ai_promt = f"Propose a changelog entry in bullets for {cl4diff}"
            # openAIPromt = f"Propose a descriptive changelog entry for {cl4diff}"

            cl4diff_result = chat_gpt_cached_answer(open_ai_promt)
            print("ChatGPT Response: " + cl4diff_result)

            changelog_str = changelog_str + f"Changes in {new_path}\n{cl4diff_result}\n\n"

        return jsonify(success=True, url=url, prompt=open_ai_promt, mr_chages=mr_changes_str, project_path=project_path_with_namespace.replace("%2F", "/"), project_id=project_id, mr_id=merge_request_id, changelog=changelog_str)
    else:
        print(response.json())
        print(f"Failed to retrieve merge request changes. Status code: {response.status_code}")

        return jsonify(success=True, url=url, mr_chages=mr_changes_str, project_path=project_path_with_namespace.replace("%2F", "/"), project_id=project_id, mr_id=merge_request_id, changelog=changelog_str)


if __name__ == '__main__':
    app.run(debug=True)
