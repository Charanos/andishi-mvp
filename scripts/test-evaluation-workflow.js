// Test script for developer evaluation workflow
const { SignJWT } = require('jose');

// Test configuration
const TEST_CONFIG = {
  baseUrl: 'http://localhost:3000',
  // Using a simple secret for testing - matches the decode-only JWT system
  secret: 'your-secret-key',
  testAssessmentId: 'test-assessment-123',
  testDeveloperId: 'test-developer-456',
  testEvaluatorEmail: 'evaluator@test.com',
};

// Generate a test evaluation token
async function generateTestToken() {
  const secret = new TextEncoder().encode(TEST_CONFIG.secret);
  
  const token = await new SignJWT({
    assessmentId: TEST_CONFIG.testAssessmentId,
    developerId: TEST_CONFIG.testDeveloperId,
    evaluatorEmail: TEST_CONFIG.testEvaluatorEmail,
    type: 'evaluation'
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret);
  
  console.log('Generated test token:', token);
  console.log('Evaluation URL:', `${TEST_CONFIG.baseUrl}/developer-evaluation/${token}`);
  
  return token;
}

// Test token validation
async function testTokenValidation(token) {
  try {
    const response = await fetch(`${TEST_CONFIG.baseUrl}/api/evaluations/validate/${token}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const data = await response.json();
    
    console.log('Token validation response:', {
      status: response.status,
      data: data
    });
    
    return response.ok;
  } catch (error) {
    console.error('Token validation failed:', error.message);
    return false;
  }
}

// Test evaluation submission
async function testEvaluationSubmission(token) {
  const testEvaluationData = {
    developerName: 'John Doe',
    developerEmail: 'john@example.com',
    technicalExpertise: 4,
    codeQuality: 4,
    problemSolving: 5,
    systemDesign: 3,
    debugging: 4,
    communication: 4,
    teamwork: 5,
    timeManagement: 3,
    clientInteraction: 4,
    leadership: 3,
    projectComplexity: 'senior',
    deliverySuccess: 4,
    technicalChallenges: 'Implemented microservices architecture',
    overallRating: 4,
    recommendation: 'recommend',
    strengths: 'Excellent problem-solving skills and team collaboration',
    improvements: 'Could improve time management',
    additionalComments: 'Great developer to work with',
    evaluatorName: 'Jane Smith',
    evaluatorEmail: 'jane@company.com',
    evaluatorRole: 'Tech Lead',
    evaluatorCompany: 'Test Company',
    relationshipDuration: '1 year',
  };

  try {
    const response = await fetch(`${TEST_CONFIG.baseUrl}/api/evaluations/submit/${token}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(testEvaluationData),
    });
    
    const data = await response.json();
    
    console.log('Evaluation submission response:', {
      status: response.status,
      data: data
    });
    
    return response.ok;
  } catch (error) {
    console.error('Evaluation submission failed:', error.message);
    return false;
  }
}

// Run the complete test workflow
async function runWorkflowTest() {
  console.log('🧪 Starting Developer Evaluation Workflow Test\n');
  
  // Step 1: Generate test token
  console.log('1. Generating test evaluation token...');
  const token = await generateTestToken();
  console.log('✅ Token generated\n');
  
  // Step 2: Test token validation (simulates user clicking evaluation link)
  console.log('2. Testing token validation...');
  const validationSuccess = await testTokenValidation(token);
  if (validationSuccess) {
    console.log('✅ Token validation successful\n');
  } else {
    console.log('❌ Token validation failed\n');
    return;
  }
  
  // Step 3: Test evaluation submission
  console.log('3. Testing evaluation submission...');
  const submissionSuccess = await testEvaluationSubmission(token);
  if (submissionSuccess) {
    console.log('✅ Evaluation submission successful\n');
  } else {
    console.log('❌ Evaluation submission failed\n');
    return;
  }
  
  console.log('🎉 All tests passed! Evaluation workflow is working correctly.');
  
  // Display URLs for manual testing
  console.log('\n📋 Manual Testing URLs:');
  console.log(`- Evaluation Form: ${TEST_CONFIG.baseUrl}/developer-evaluation/${token}`);
  console.log(`- Thank You Page: ${TEST_CONFIG.baseUrl}/thank-you-evaluation`);
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    generateTestToken,
    testTokenValidation,
    testEvaluationSubmission,
    runWorkflowTest,
    TEST_CONFIG,
  };
}

// Run test if called directly
if (require.main === module) {
  runWorkflowTest().catch(console.error);
}
