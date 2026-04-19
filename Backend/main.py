from Core.parser import rawParsing
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import json

logs = []
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # allow all (for development)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def startup_event():
    global logs
    logs = rawParsing()
    print(f"Logs loaded: {len(logs)} entries")


@app.get("/logs")
def get_logs():
    return {"logs": logs}

@app.get("/sourcelist")
def sourceList_fetch():
    source  = set()
    for e in logs:
        source.add(e["source"])
    return source
              
def main():
    print("Backend is healthy")

if __name__ == "__main__":
    main()
