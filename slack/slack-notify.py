import os
import subprocess
import json
import urllib.request
import urllib.error

def slack_alert():
    attachments = []

    attachments.append({
        'color': '#767676',
        'title': 'Deployed to ' + os.getenv('PROJECT_ID'),
        'text': '\n' + os.getenv('REPO_NAME')
    })

    text = 'Commit <https://github.com/ONSdigital/' + os.getenv('REPO_NAME') + '/commit/' + os.getenv('COMMIT_SHA') + '|' + os.getenv('SHORT_SHA') + '> of ' + os.getenv('REPO_NAME') + ' has been deployed to *' + os.getenv('PROJECT_ID') + '*, to view the cloud build job click <https://console.cloud.google.com/cloud-build/builds/' + os.getenv('BUILD_ID') + '?project=' + os.getenv('PROJECT_ID') + '|here>'
    print(text)

    message = {
        'channel': os.getenv('SLACK_CHANNEL'),
        'icon_emoji': ':terraform:',
        'username': 'Terraform ' + os.getenv('REPO_NAME'),
        'text': text,
        'attachments': attachments
    }
    data = json.dumps(message).encode('utf-8')
    headers = {'Content-Type': 'application/json'}
    try:
        urllib.request.urlopen(urllib.request.Request(
            os.getenv('SLACK_WEBHOOK'), data=data, headers=headers))
    except urllib.error.HTTPError as e:
        print(e.read().decode('utf-8'))
        raise e

if __name__ == '__main__':
    try:
        slack_alert()
    except:
        print("Slack Webhook Failed")
