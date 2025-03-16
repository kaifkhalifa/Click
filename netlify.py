from app import app

# This is for Netlify serverless functions
def handler(event, context):
    return {
        'statusCode': 200,
        'headers': {
            'Content-Type': 'text/html',
        },
        'body': 'Flask app is running on Netlify!'
    } 