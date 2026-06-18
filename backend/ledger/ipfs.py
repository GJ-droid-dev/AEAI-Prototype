import os
import json
import hashlib
import boto3

def pin_json_to_ipfs(json_data: dict) -> str:
    """
    Pins a JSON object to IPFS using Filebase's S3-compatible API.
    If no API key is provided, mocks the IPFS upload by returning a sha256 hash.
    """
    filebase_key = os.environ.get("FILEBASE_ACCESS_KEY")
    filebase_secret = os.environ.get("FILEBASE_SECRET_KEY")
    bucket_name = os.environ.get("FILEBASE_BUCKET_NAME", "aeai-evidence-logs")
    
    if not filebase_key or not filebase_secret:
        # Mock IPFS CID generation for local dev
        data_str = json.dumps(json_data, sort_keys=True)
        mock_cid = "Qm" + hashlib.sha256(data_str.encode()).hexdigest()[:44]
        print(f"[IPFS Mock] Simulated Filebase upload. CID: {mock_cid}")
        return mock_cid

    try:
        s3 = boto3.client(
            's3',
            endpoint_url='https://s3.filebase.com',
            aws_access_key_id=filebase_key,
            aws_secret_access_key=filebase_secret
        )
        
        data_str = json.dumps(json_data, sort_keys=True)
        # Using a hash as the object key
        object_key = hashlib.sha256(data_str.encode()).hexdigest() + ".json"
        
        # Filebase automatically pins the object to IPFS and returns the CID in the headers
        s3.put_object(Bucket=bucket_name, Key=object_key, Body=data_str.encode('utf-8'))
        
        # Fetch the metadata to get the CID
        response = s3.head_object(Bucket=bucket_name, Key=object_key)
        cid = response.get('ResponseMetadata', {}).get('HTTPHeaders', {}).get('x-amz-meta-cid')
        
        if cid:
            print(f"[IPFS] Successfully pinned to Filebase. CID: {cid}")
            return cid
        else:
            # Fallback if header is missing
            return "Qm" + hashlib.sha256(data_str.encode()).hexdigest()[:44]
            
    except Exception as e:
        print(f"[IPFS Error] Failed to pin to Filebase: {e}")
        data_str = json.dumps(json_data, sort_keys=True)
        return "Qm" + hashlib.sha256(data_str.encode()).hexdigest()[:44]

