from fastapi import FastAPI

app = FastAPI(title="BKFT Chatbot API")


@app.get("/")
def root():
    return {"message": "Chatbot Service is running"}
