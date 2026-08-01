from fastapi import Request, HTTPException, Depends

def get_current_user(request: Request):
    auth_header = request.headers.get("Authorization")
    if auth_header and auth_header.startswith("Bearer "):
        token = auth_header.split(" ")[1]
        # In a full implementation, we'd decode the JWT or verify with Supabase.
        # For demo purposes, we can assume the token might contain the role,
        # but here we'll just mock it based on headers or default to admin.
        pass
    
    # Returning a mock user for now. 
    # In production, raise 401 if token is invalid.
    return {"id": "demo", "role": "admin"}

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
