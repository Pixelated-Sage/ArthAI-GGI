import firebase_admin
from firebase_admin import credentials, auth

# Initialize (if not already)
if not firebase_admin._apps:
    cred = credentials.Certificate('config/serviceAccountKey.json')
    firebase_admin.initialize_app(cred)

# Get user by email
try:
    user = auth.get_user_by_email('test@finpredict.ai')
    print(f'✅ User found:')
    print(f'   UID: {user.uid}')
    print(f'   Email: {user.email}')
    print(f'   Display Name: {user.display_name}')
    print(f'   Email Verified: {user.email_verified}')
except auth.UserNotFoundError:
    print('❌ User not found')
except Exception as e:
    print(f'❌ Error: {e}')