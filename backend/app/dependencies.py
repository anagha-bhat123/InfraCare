from fastapi import Request, HTTPException, Depends

def get_current_user(request: Request):
    return {"id": "demo", "role": "engineer"}

class RoleChecker:
    def __init__(self, allowed_roles: list):
        self.allowed_roles = allowed_roles

    def __call__(self, user: dict = Depends(get_current_user)):
        return user
