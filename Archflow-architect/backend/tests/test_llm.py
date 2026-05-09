import os
from dotenv import load_dotenv
from langchain_groq import ChatGroq
import traceback

def test_groq():
    print("Testing Groq connection...")
    
    print("Current working directory:", os.getcwd())
    # Explicitly calculate absolute path to .env
    env_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), ".env")
    print(f"Looking for .env at: {env_path}")
    print(f".env exists: {os.path.exists(env_path)}")
    
    # Load .env
    load_dotenv(dotenv_path=env_path)
    
    api_key = os.getenv("GROQ_API_KEY")
    print("Loaded API KEY:", api_key)
    
    if not api_key:
        print("ERROR: GROQ_API_KEY is not set in .env")
        return
        
    try:
        print("Sending prompt...")
        llm = ChatGroq(
            temperature=0.2,
            groq_api_key=api_key,
            model_name="llama-3.3-70b-versatile"
        )
        
        response = llm.invoke("Say hello in one sentence")
        print("Received response:")
        print(response.content)
        
    except Exception as e:
        print("ERROR during Groq connection:")
        traceback.print_exc()

if __name__ == "__main__":
    test_groq()
