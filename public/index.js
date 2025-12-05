document.addEventListener('DOMContentLoaded', function () {
    // Get current page from URL
    const path = window.location.pathname;
    const page = path.split('/').pop();

    // Hide all pages initially
    const pages = document.querySelectorAll('.page');
    pages.forEach(p => p.classList.remove('active'));

    // Show the correct page based on URL
    if (page === 'single-post.html') {
        document.getElementById('single-post').classList.add('active');
        // Load single post data here if needed
    } else if (page === 'admin-login.html') {
        document.getElementById('admin-login').classList.add('active');
    } else if (page === 'admin-signup.html') {
        document.getElementById('admin-signup').classList.add('active');
    } else if (page === 'create-post.html') {
        document.getElementById('create-post').classList.add('active');
    } else {
        document.getElementById('homepage').classList.add('active');
        // Load posts on homepage
        fetchPosts();
    }

            // Mobile menu toggle
            const hamburger = document.querySelector('.hamburger');
            const navLinks = document.querySelector('.nav-links');

            if (hamburger) {
                hamburger.addEventListener('click', function() {
                    navLinks.classList.toggle('active');
                });
            }

            // Load posts dynamically on homepage
            if (page === '' || page === 'index.html') {
                loadPosts();
            }

    // Function to fetch and display posts on homepage
    function fetchPosts() {
        fetch('/api/posts')
            .then(res => res.json())
            .then(posts => {
                const postsGrid = document.querySelector('.posts-grid');
                if (!postsGrid) return;
                postsGrid.innerHTML = '';
                posts.forEach(post => {
                    postsGrid.innerHTML += `
                    <div class="post-card">
                        <div class="post-image">${post.imageUrl ? `<img src="${post.imageUrl}" alt="${post.title}" style="width:100%; height:100%; object-fit:cover;"/>` : 'Featured Image'}</div>
                        <div class="post-content">
                            <div class="post-meta">
                                <span>${post.author}</span>
                                <span>${new Date(post.createdAt).toLocaleDateString()}</span>
                            </div>
                            <h3 class="post-title">${post.title}</h3>
                            <p class="post-excerpt">${post.excerpt}</p>
                            <a href="single-post.html?id=${post._id}" class="read-more">Read More</a>
                        </div>
                    </div>
                    `;
                });
            })
            .catch(err => console.error('Error loading posts:', err));
    }

    // Function to load posts for admin dashboard
    function loadPostsForDashboard() {
        fetch('/api/posts')
            .then(res => res.json())
            .then(posts => {
                const postsList = document.getElementById('posts-list');
                if (!postsList) return;
                postsList.innerHTML = '';
                posts.forEach(post => {
                    postsList.innerHTML += `
                    <div class="post-card">
                        <div class="post-image">${post.imageUrl ? `<img src="${post.imageUrl}" alt="${post.title}" style="width:100%; height:100%; object-fit:cover;"/>` : 'Featured Image'}</div>
                        <div class="post-content">
                            <div class="post-meta">
                                <span>${post.author}</span>
                                <span>${new Date(post.createdAt).toLocaleDateString()}</span>
                            </div>
                            <h3 class="post-title">${post.title}</h3>
                            <p class="post-excerpt">${post.excerpt}</p>
                            <a href="single-post.html?id=${post._id}" class="read-more">Read More</a>
                            <div class="post-actions">
                                <button class="btn btn-danger" onclick="deletePost('${post._id}')">Delete</button>
                            </div>
                        </div>
                    </div>
                    `;
                });
            })
            .catch(err => console.error('Error loading posts for dashboard:', err));
    }

    // Function to delete a post
    function deletePost(postId) {
        if (confirm('Are you sure you want to delete this post?')) {
            fetch(`/api/posts/${postId}`, {
                method: 'DELETE',
                credentials: 'include'
            }).then(res => {
                if (res.ok) {
                    alert('Post deleted successfully!');
                    loadPostsForDashboard(); // Reload posts after deletion
                } else {
                    alert('Failed to delete post');
                }
            }).catch(err => {
                alert('Failed to delete post');
                console.error('Delete error:', err);
            });
        }
    }

    // Admin login form submission
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', function (e) {
            e.preventDefault();
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;

            fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({ username, password })
            }).then(res => {
                if (res.ok) {
                    alert('Login successful!');
                    window.location.href = 'admin-dashboard.html'; // Redirect to dashboard after login
                } else {
                    alert('Invalid username or password');
                }
            }).catch(err => {
                alert('Login failed');
                console.error('Login error:', err);
            });
        });
    }

    // Logout functionality
    const logoutLink = document.getElementById('logout-link');
    if (logoutLink) {
        logoutLink.addEventListener('click', function (e) {
            e.preventDefault();
            fetch('/api/auth/logout', {
                method: 'POST',
                credentials: 'include'
            }).then(res => {
                if (res.ok) {
                    alert('Logged out successfully!');
                    window.location.href = 'index.html';
                } else {
                    alert('Logout failed');
                }
            }).catch(err => {
                alert('Logout failed');
                console.error('Logout error:', err);
            });
        });
    }

    // Create post form submission
    const createPostForm = document.getElementById('create-post-form');
    if (createPostForm) {
        createPostForm.addEventListener('submit', function (e) {
            e.preventDefault();
            const title = document.getElementById('post-title').value;
            const author = document.getElementById('post-author').value;
            const excerpt = document.getElementById('post-excerpt').value;
            const content = document.getElementById('post-content').value;
            const imageUrl = document.getElementById('post-image').value;

            fetch('/api/posts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({ title, author, excerpt, content, imageUrl })
            }).then(res => {
                if (res.ok) {
                    alert('Post created successfully!');
                    window.location.href = 'index.html';
                } else if (res.status === 401) {
                    alert('You are not authorized. Please login.');
                    window.location.href = 'admin-login.html';
                } else {
                    alert('Failed to create post');
                }
            }).catch(err => {
                alert('Failed to create post');
                console.error('Post creation error:', err);
            });
        });
    }
});
