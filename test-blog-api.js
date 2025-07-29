const testBlogCreation = async () => {
  try {
    console.log('Testing blog creation API...');
    
    // Test data
    const testData = {
      title: 'Test Blog Post',
      excerpt: 'This is a test blog post excerpt',
      content: 'This is the full content of the test blog post. It should be long enough to test the read time calculation.',
      author: 'Test Author',
      category: 'Technology',
      image: '/images/test-blog.jpg',
      authorImage: '/images/test-author.jpg'
    };
    
    console.log('Sending test data:', testData);
    
    // Make API request
    const response = await fetch('http://localhost:3000/api/blogs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Add auth header if needed
        // 'Authorization': 'Bearer YOUR_JWT_TOKEN_HERE'
      },
      body: JSON.stringify(testData)
    });
    
    const result = await response.json();
    console.log('Response status:', response.status);
    console.log('Response data:', result);
    
  } catch (error) {
    console.error('Test failed with error:', error);
  }
};

// Run the test
testBlogCreation();
