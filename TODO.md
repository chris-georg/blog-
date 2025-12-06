# Blog Authorization Updates

## Completed Tasks

- [x] Remove ownership check for post deletion - now any logged-in user can delete any post
- [x] Add debug logging to authMiddleware to troubleshoot session issues
- [x] Update session config to allow cross-origin cookies in development (sameSite: "none", secure: false)

## Summary

- Publishing posts: Already working for authenticated users
- Deleting posts: Now allows any logged-in user to delete any post (removed ownership restriction)
- Session issues: Added logging and updated cookie settings to fix potential cross-origin problems in development

## Next Steps

- Test the changes by logging in and trying to create/delete posts
- Check server logs for auth middleware debug output
- If issues persist, may need to verify frontend is sending cookies correctly
