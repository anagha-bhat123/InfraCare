import asyncio
from app.database import supabase
from datetime import datetime

async def main():
    if not supabase:
        print("No supabase")
        return
    data = b"hello"
    filename = "test.txt"
    report_id = "123"
    content_type = "text/plain"
    
    path = f"reports/{report_id}/{int(datetime.utcnow().timestamp())}-{filename}"
    storage = supabase.storage.from_("report-photos")
    
    res = storage.upload(path, data, {"content-type": content_type})
    print(res)
    public_url = storage.get_public_url(path)
    print(public_url)

asyncio.run(main())
