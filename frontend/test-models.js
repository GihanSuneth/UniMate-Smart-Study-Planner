import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI('AIzaSyB7Z6jMM4Dmt68Vy3-m9gZBxkZgflq8ZzM');

async function test() {
  try {
    // There isn't a direct listModels exposed cleanly in some versions of the SDK,
    // so using standard fetch is more reliable.
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models?key=AIzaSyB7Z6jMM4Dmt68Vy3-m9gZBxkZgflq8ZzM');
    const data = await response.json();
    console.log(data.models.map(m => m.name).join('\\n'));
  } catch(e) {
    console.error(e);
  }
}
test();
