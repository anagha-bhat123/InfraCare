from fastapi import Request, HTTPException, Depends

def get_current_user(request: Request):
    role = request.headers.get("X-User-Role")
    auth_header = request.headers.get("Authorization")
    if auth_header and auth_header.startswith("Bearer "):
        token = auth_header.split(" ")[1]
        # In a full implementation, we'd decode the JWT or verify with Supabase.
        pass
    
    # Returning a mock user for now. 
    return {"id": "demo", "role": role or "admin"}

class RoleChecker:
    def __init__(self, allowed_roles: list):
        self.allowed_roles = allowed_roles

    def __call__(self, user: dict = Depends(get_current_user)):
        if user.get("role") not in self.allowed_roles and "admin" not in self.allowed_roles:
            raise HTTPException(
                status_code=403, 
                detail=f"Role {user.get('role')} is not permitted. Allowed: {self.allowed_roles}"
            )
        return user
