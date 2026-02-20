import firebase_admin
from firebase_admin import credentials, firestore

try:
    # Initialize Firebase Admin
    cred = credentials.Certificate('config/serviceAccountKey.json')
    firebase_admin.initialize_app(cred)
    
    # Test Firestore connection
    db = firestore.client()
    
    # Try to write a test document
    test_ref = db.collection('test').document('test_doc')
    test_ref.set({
        'message': 'Firebase connection successful!',
        'timestamp': firestore.SERVER_TIMESTAMP
    })
    
    # Try to read it back
    doc = test_ref.get()
    if doc.exists:
        print('✅ Firebase connection successful!')
        print(f'Test data: {doc.to_dict()}')
    else:
        print('❌ Could not read test document')
    
    # Clean up
    test_ref.delete()
    print('✅ Test document deleted')
    
except Exception as e:
    print(f'❌ Error: {e}')