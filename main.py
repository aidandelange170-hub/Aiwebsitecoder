import os
import uuid
import torch
from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel
from sqlalchemy import create_engine, Column, Integer, String, Text, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship

from transformers import AutoTokenizer, AutoModelForCausalLM, pipeline
from diffusers import StableDiffusionPipeline

app = FastAPI()
app.add_middleware(
    CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"]
)
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

Base = declarative_base()
class User(Base):
    __tablename__ = 'users'
    id = Column(Integer, primary_key=True)
    username = Column(String(80), unique=True, nullable=False)
    password = Column(String(256), nullable=False)
    favorites = relationship("Favorite", back_populates="user")

class Project(Base):
    __tablename__ = 'projects'
    id = Column(Integer, primary_key=True)
    title = Column(String(100), nullable=False)
    author = Column(String(100), nullable=False)
    html = Column(Text, nullable=False)
    description = Column(Text, nullable=True)
    tags = Column(Text, nullable=True)
    forked_from = Column(Integer, ForeignKey('projects.id'), nullable=True)
    versions = relationship("ProjectVersion", back_populates="project")

class ProjectVersion(Base):
    __tablename__ = 'project_versions'
    id = Column(Integer, primary_key=True)
    project_id = Column(Integer, ForeignKey('projects.id'))
    html = Column(Text, nullable=False)
    created_at = Column(String(32), nullable=False)
    project = relationship("Project", back_populates="versions")

class Favorite(Base):
    __tablename__ = 'favorites'
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('users.id'))
    project_id = Column(Integer, ForeignKey('projects.id'))
    user = relationship("User", back_populates="favorites")

engine = create_engine("sqlite:///projects.db")
Base.metadata.create_all(engine)
SessionLocal = sessionmaker(bind=engine)

# ---- Model registry (ALL models, including 15 120B models) ----
MODEL_LIST = {
    # Previous and new models (shortened for space, add all your other models here)
    "codegen-350m": "Salesforce/codegen-350M-multi",
    "codegen-2b": "Salesforce/codegen-2B-multi",
    "codegen-6b": "Salesforce/codegen-6B-mono",
    "codegen-16b": "Salesforce/codegen-16B-mono",
    "starcoder": "bigcode/starcoder",
    "starcoderbase": "bigcode/starcoderbase",
    "starcoderplus": "HuggingFaceH4/starchat-alpha",
    "starcoder2-3b": "bigcode/starcoder2-3b",
    "starcoder2-3b-instruct": "bigcode/starcoder2-3b-instruct",
    "starcoder2-7b": "bigcode/starcoder2-7b",
    "starcoder2-15b": "bigcode/starcoder2-15b",
    "starcoder2-15b-instruct": "bigcode/starcoder2-15b-instruct",
    "phind-codellama-34b": "Phind/Phind-CodeLlama-34B-v2",
    "phind-codellama-70b": "Phind/Phind-CodeLlama-70B-v2",
    "codellama-7b": "codellama/CodeLlama-7b-hf",
    "codellama-13b": "codellama/CodeLlama-13b-hf",
    "codellama-34b": "codellama/CodeLlama-34b-hf",
    "codellama-70b": "codellama/CodeLlama-70b-hf",
    "codellama-70b-instruct": "codellama/CodeLlama-70b-Instruct-hf",
    "codellama-7b-instruct": "codellama/CodeLlama-7b-Instruct-hf",
    "codellama-13b-instruct": "codellama/CodeLlama-13b-Instruct-hf",
    "codellama-34b-instruct": "codellama/CodeLlama-34b-Instruct-hf",
    "codellama-python-7b": "codellama/CodeLlama-7b-Python-hf",
    "codellama-python-13b": "codellama/CodeLlama-13b-Python-hf",
    "codellama-python-34b": "codellama/CodeLlama-34b-Python-hf",
    "codellama-python-70b": "codellama/CodeLlama-70b-Python-hf",
    "mixtral-8x7b": "mistralai/Mixtral-8x7B-Instruct-v0.1",
    "mixtral-8x22b": "mistralai/Mixtral-8x22B-v0.1",
    "wizardcoder-15b": "WizardLM/WizardCoder-15B-V1.0",
    "wizardcoder-34b": "WizardLM/WizardCoder-34B-V1.0",
    "wizardcoder-python-34b": "WizardLM/WizardCoder-Python-34B-V1.0",
    "deepseek-coder-1.3b": "deepseek-ai/deepseek-coder-1.3b-instruct",
    "deepseek-coder-6.7b": "deepseek-ai/deepseek-coder-6.7b-instruct",
    "deepseek-coder-7b": "deepseek-ai/deepseek-coder-7b-instruct",
    "deepseek-coder-33b": "deepseek-ai/deepseek-coder-33b-instruct",
    "deepseek-coder-33b-instruct": "deepseek-ai/deepseek-coder-33b-instruct",
    "octocoder-15b": "bigcode/octocoder-15b",
    "replit-code-v1-3b": "replit/replit-code-v1-3b",
    "replit-code-v1-7b": "replit/replit-code-v1-7b",
    "codefuse-coder-13b": "CodeFuse/CodeFuse-CodeLlama-13B-v1",
    "codefuse-coder-34b": "CodeFuse/CodeFuse-CodeLlama-34B-v1",
    "gemma-7b": "google/gemma-7b",
    "qwen1.5-72b": "Qwen/Qwen1.5-72B",
    "llama-70b": "togethercomputer/CodeLlama-70b-hf",
    "llama3-70b": "meta-llama/Meta-Llama-3-70B",
    # 15 hypothetical 120B coding models
    "codellama-120b-v1": "codellama/CodeLlama-120b-hf",
    "codellama-120b-instruct": "codellama/CodeLlama-120b-Instruct-hf",
    "codellama-120b-python": "codellama/CodeLlama-120b-Python-hf",
    "deepseek-coder-120b": "deepseek-ai/deepseek-coder-120b-instruct",
    "starcoder2-120b": "bigcode/starcoder2-120b",
    "starcoder2-120b-instruct": "bigcode/starcoder2-120b-instruct",
    "mixtral-120b": "mistralai/Mixtral-120B-v0.1",
    "llama-coder-120b": "meta-llama/LlamaCoder-120B",
    "wizardcoder-120b": "WizardLM/WizardCoder-120B-V1.0",
    "phind-codellama-120b": "Phind/Phind-CodeLlama-120B-v2",
    "octocoder-120b": "bigcode/octocoder-120b",
    "replit-code-v1-120b": "replit/replit-code-v1-120b",
    "qwen-coder-120b": "Qwen/Qwen1.5-Coder-120B",
    "codefuse-coder-120b": "CodeFuse/CodeFuse-CodeLlama-120B-v1",
    "gemma-coder-120b": "google/gemma-coder-120B",
    # Our free copilot!
    "ourcopilot": "aidandelange170-hub/ourcopilot-ensemble"
}

LOADED_MODELS = {}

def load_model(model_key):
    if model_key not in LOADED_MODELS:
        name = MODEL_LIST[model_key]
        tokenizer = AutoTokenizer.from_pretrained(name)
        model = AutoModelForCausalLM.from_pretrained(name, torch_dtype=torch.float16 if torch.cuda.is_available() else torch.float32)
        pipe = pipeline("text-generation", model=model, tokenizer=tokenizer, device=0 if torch.cuda.is_available() else -1)
        LOADED_MODELS[model_key] = pipe
    return LOADED_MODELS[model_key]

IMG_PIPE = None
def get_img_pipe():
    global IMG_PIPE
    if IMG_PIPE is None:
        IMG_PIPE = StableDiffusionPipeline.from_pretrained("stabilityai/stable-diffusion-2", torch_dtype=torch.float16 if torch.cuda.is_available() else torch.float32)
        IMG_PIPE = IMG_PIPE.to("cuda" if torch.cuda.is_available() else "cpu")
    return IMG_PIPE

# --- Models ---
class CodePrompt(BaseModel):
    prompt: str
    model: str

class ProjectIn(BaseModel):
    title: str
    author: str
    html: str

class VideoPrompt(BaseModel):
    prompt: str

class MultiAICodePrompt(BaseModel):
    prompt: str
    model: str

class DescribePrompt(BaseModel):
    html: str

# --- AI Code Generation ---
@app.post("/api/ai/generate-code")
async def generate_code(data: CodePrompt):
    if data.model not in MODEL_LIST:
        raise HTTPException(status_code=400, detail="Model not supported")
    if data.model == "ourcopilot":
        best_model_key = "codellama-120b-instruct" if "codellama-120b-instruct" in MODEL_LIST else "codellama-70b-instruct"
        pipe = load_model(best_model_key)
    else:
        pipe = load_model(data.model)
    ai_prompt = (
        f"{data.prompt}\n"
        "Generate only the HTML, CSS, and JS code files for this project. "
        "Output the HTML in a <html>...</html> code block, CSS in a <style>...</style> code block, and JS in a <script>...</script> code block. "
        "Do not include explanations or anything else."
    )
    result = pipe(ai_prompt, max_length=2048, do_sample=True, temperature=0.7)
    code = result[0]['generated_text']
    return {"code": code}

@app.post("/api/ai/generate-multiai-code")
async def generate_multiai_code(data: MultiAICodePrompt):
    model_key = data.model
    if model_key not in MODEL_LIST:
        return {"code": "<!-- Model not available -->"}
    pipe = load_model(model_key)
    ai_prompt = (
        f"{data.prompt}\n"
        "Generate only the HTML, CSS, and JS code files for this project. "
        "Output the HTML in a <html>...</html> code block, CSS in a <style>...</style> code block, and JS in a <script>...</script> code block. "
        "Do not include explanations or anything else."
    )
    result = pipe(ai_prompt, max_length=2048, do_sample=True, temperature=0.7)
    code = result[0]['generated_text']
    return {"code": code}

@app.post("/api/ai/generate-image")
async def generate_image(prompt: CodePrompt):
    pipe = get_img_pipe()
    image = pipe(prompt.prompt, num_inference_steps=30).images[0]
    img_name = f"generated_{uuid.uuid4().hex[:8]}.png"
    img_path = os.path.join("generated_images", img_name)
    os.makedirs("generated_images", exist_ok=True)
    image.save(img_path)
    return {"imageUrl": f"/api/images/{img_name}"}

@app.get("/api/images/{img_name}")
async def get_image(img_name: str):
    img_path = os.path.join("generated_images", img_name)
    if os.path.exists(img_path):
        return FileResponse(img_path)
    return JSONResponse({"error": "Not found"}, status_code=404)

@app.post("/api/ai/generate-video")
async def generate_video(prompt: VideoPrompt):
    import imageio
    video_frames = [255 * torch.ones(64, 64, 3, dtype=torch.uint8).numpy() for _ in range(16)]
    video_name = f"generated_{uuid.uuid4().hex[:8]}.gif"
    video_path = os.path.join("generated_videos", video_name)
    os.makedirs("generated_videos", exist_ok=True)
    imageio.mimsave(video_path, video_frames, fps=8)
    return {"videoUrl": f"/api/videos/{video_name}"}

@app.get("/api/videos/{video_name}")
async def get_video(video_name: str):
    video_path = os.path.join("generated_videos", video_name)
    if os.path.exists(video_path):
        return FileResponse(video_path, media_type="image/gif")
    return JSONResponse({"error": "Not found"}, status_code=404)

# --- AI Description & Tags ---
@app.post("/api/ai/describe")
async def ai_describe(data: DescribePrompt):
    description = "A modern web project generated by AI."
    tags = ["AI", "Web", "Project"]
    return {"description": description, "tags": tags}

# --- Project Templates ---
TEMPLATES = [
    {"id": 1, "title": "Portfolio", "description": "Personal portfolio website", "html": "<html>...</html>"},
    {"id": 2, "title": "Blog", "description": "Clean blog starter", "html": "<html>...</html>"},
    {"id": 3, "title": "Landing Page", "description": "Modern landing page", "html": "<html>...</html>"}
]
@app.get("/api/templates")
async def get_templates():
    return TEMPLATES

# --- Smart Search ---
@app.get("/api/search")
async def smart_search(q: str):
    db = SessionLocal()
    projects = db.query(Project).filter(Project.title.ilike(f"%{q}%")).all()
    db.close()
    return [{"id": p.id, "title": p.title, "author": p.author} for p in projects]

# --- Instant Preview ---
@app.get("/api/preview/{project_id}")
async def instant_preview(project_id: int):
    db = SessionLocal()
    project = db.query(Project).filter(Project.id == project_id).first()
    db.close()
    if not project:
        raise HTTPException(404)
    file_path = f"/tmp/preview_{project_id}.html"
    with open(file_path, "w") as f:
        f.write(project.html)
    return FileResponse(file_path, media_type="text/html")

@app.post("/api/projects")
async def save_project(data: ProjectIn):
    db = SessionLocal()
    project = Project(title=data.title, author=data.author, html=data.html)
    db.add(project)
    db.commit()
    db.refresh(project)
    from datetime import datetime
    version = ProjectVersion(project_id=project.id, html=data.html, created_at=str(datetime.utcnow()))
    db.add(version)
    db.commit()
    db.close()
    return {"id": project.id}

@app.get("/api/projects")
async def list_projects():
    db = SessionLocal()
    projects = db.query(Project).all()
    db.close()
    return [{"id": p.id, "title": p.title, "author": p.author, "description": p.description or "", "tags": p.tags or ""} for p in projects]

@app.get("/api/projects/{project_id}")
async def get_project(project_id: int):
    db = SessionLocal()
    project = db.query(Project).filter(Project.id == project_id).first()
    db.close()
    if not project:
        raise HTTPException(404)
    return {"id": project.id, "title": project.title, "author": project.author, "html": project.html, "description": project.description, "tags": project.tags}

@app.post("/api/projects/{project_id}/fork")
async def fork_project(project_id: int, author: str):
    db = SessionLocal()
    parent = db.query(Project).filter(Project.id == project_id).first()
    if not parent:
        db.close()
        raise HTTPException(status_code=404)
    new_project = Project(
        title=parent.title + " (fork)",
        author=author,
        html=parent.html,
        forked_from=parent.id
    )
    db.add(new_project)
    db.commit()
    db.refresh(new_project)
    db.close()
    return {"id": new_project.id}

@app.post("/api/favorite/{project_id}")
async def favorite_project(project_id: int, token: str = Depends(oauth2_scheme)):
    username = "demo"
    db = SessionLocal()
    user = db.query(User).filter(User.username == username).first()
    if not user:
        user = User(username=username, password="demo")
        db.add(user)
        db.commit()
        db.refresh(user)
    fav = Favorite(user_id=user.id, project_id=project_id)
    db.add(fav)
    db.commit()
    db.close()
    return {"status": "ok"}

@app.get("/api/projects/{project_id}/versions")
async def get_versions(project_id: int):
    db = SessionLocal()
    versions = db.query(ProjectVersion).filter(ProjectVersion.project_id == project_id).all()
    db.close()
    return [{"id": v.id, "created_at": v.created_at} for v in versions]

@app.get("/api/projects/{project_id}/versions/{version_id}")
async def get_version(project_id: int, version_id: int):
    db = SessionLocal()
    version = db.query(ProjectVersion).filter(ProjectVersion.project_id == project_id, ProjectVersion.id == version_id).first()
    db.close()
    if not version:
        raise HTTPException(404)
    return {"id": version.id, "html": version.html, "created_at": version.created_at}

collab_sessions = {}
@app.websocket("/ws/collab/{project_id}")
async def websocket_endpoint(websocket: WebSocket, project_id: int):
    await websocket.accept()
    if project_id not in collab_sessions:
        collab_sessions[project_id] = set()
    collab_sessions[project_id].add(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            for ws in collab_sessions[project_id]:
                if ws != websocket:
                    await ws.send_text(data)
    except WebSocketDisconnect:
        collab_sessions[project_id].remove(websocket)

@app.post("/token")
async def login():
    return {"access_token": "demo", "token_type": "bearer"}