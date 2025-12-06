"""
Router para upload de arquivos
"""

from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from app.utils.dependencies import get_current_user
from app.models.user import User
from app.services.local_storage_service import local_storage_service

router = APIRouter(prefix="/upload", tags=["Upload"])


@router.post("/profile-picture", response_model=dict)
async def upload_profile_picture(
    file: UploadFile = File(...), current_user: User = Depends(get_current_user)
):
    """
    Upload de foto de perfil do usuário

    - Tamanho máximo: 5MB
    - Formatos aceitos: JPG, JPEG, PNG, GIF
    """
    # Validar tipo de arquivo
    allowed_types = ["image/jpeg", "image/jpg", "image/png", "image/gif"]
    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail="Formato de arquivo não permitido. Use JPG, PNG ou GIF.",
        )

    # Validar tamanho (5MB)
    file.file.seek(0, 2)  # Ir para o final do arquivo
    file_size = file.file.tell()
    file.file.seek(0)  # Voltar ao início

    if file_size > 5 * 1024 * 1024:  # 5MB
        raise HTTPException(
            status_code=400, detail="Arquivo muito grande. Tamanho máximo: 5MB"
        )

    # Fazer upload
    url = await local_storage_service.upload_profile_picture(file, current_user.id)

    return {
        "success": True,
        "url": url,
        "message": "Foto de perfil enviada com sucesso!",
    }


@router.post("/student-document/{student_id}", response_model=dict)
async def upload_student_document(
    student_id: int,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
):
    """
    Upload de documento de aluno (PDF, DOC, DOCX)

    - Tamanho máximo: 10MB
    - Formatos aceitos: PDF, DOC, DOCX
    """
    # Validar tipo de arquivo
    allowed_types = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ]
    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail="Formato de arquivo não permitido. Use PDF, DOC ou DOCX.",
        )

    # Validar tamanho (10MB)
    file.file.seek(0, 2)
    file_size = file.file.tell()
    file.file.seek(0)

    if file_size > 10 * 1024 * 1024:  # 10MB
        raise HTTPException(
            status_code=400, detail="Arquivo muito grande. Tamanho máximo: 10MB"
        )

    # Fazer upload
    url = await local_storage_service.upload_student_document(file, student_id)

    return {"success": True, "url": url, "message": "Documento enviado com sucesso!"}


@router.post("/educational-material", response_model=dict)
async def upload_educational_material(
    file: UploadFile = File(...), current_user: User = Depends(get_current_user)
):
    """
    Upload de material educativo

    - Apenas gestores e professores podem fazer upload
    - Tamanho máximo: 20MB
    - Formatos aceitos: PDF, DOC, DOCX, PPT, PPTX, imagens, vídeos
    """
    # Verificar permissões
    if current_user.tipo_usuario not in ["gestor", "professor"]:
        raise HTTPException(
            status_code=403,
            detail="Apenas gestores e professores podem fazer upload de materiais educativos",
        )

    # Validar tipo de arquivo
    allowed_types = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/vnd.ms-powerpoint",
        "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/gif",
        "video/mp4",
        "video/mpeg",
    ]
    if file.content_type not in allowed_types:
        raise HTTPException(status_code=400, detail="Formato de arquivo não permitido.")

    # Validar tamanho (20MB)
    file.file.seek(0, 2)
    file_size = file.file.tell()
    file.file.seek(0)

    if file_size > 20 * 1024 * 1024:  # 20MB
        raise HTTPException(
            status_code=400, detail="Arquivo muito grande. Tamanho máximo: 20MB"
        )

    # Fazer upload
    url = await local_storage_service.upload_educational_material(file)

    return {
        "success": True,
        "url": url,
        "message": "Material educativo enviado com sucesso!",
    }
