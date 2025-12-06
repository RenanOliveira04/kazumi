"""
Serviço para gerenciamento de arquivos locais
"""

from fastapi import UploadFile, HTTPException
from typing import Optional
import uuid
import os
from pathlib import Path


class LocalStorageService:
    """Serviço para armazenamento local de arquivos"""

    def __init__(self, base_dir: str = "/app/uploads"):
        self.base_dir = Path(base_dir)
        self._ensure_directories()

    def _ensure_directories(self):
        """Garante que os diretórios necessários existam"""
        directories = [
            self.base_dir / "profile-pictures",
            self.base_dir / "student-documents",
            self.base_dir / "educational-materials",
        ]
        for directory in directories:
            directory.mkdir(parents=True, exist_ok=True)

    async def upload_file(
        self, file: UploadFile, folder: str, user_id: Optional[int] = None
    ) -> str:
        """
        Salva um arquivo localmente

        Args:
            file: Arquivo para upload
            folder: Pasta (ex: 'profile-pictures', 'student-documents')
            user_id: ID do usuário (opcional, usado para organizar arquivos)

        Returns:
            URL relativa do arquivo
        """
        try:
            # Gerar nome único para o arquivo
            file_extension = os.path.splitext(file.filename)[1]
            unique_filename = f"{uuid.uuid4()}{file_extension}"

            # Construir caminho local
            if user_id:
                folder_path = self.base_dir / folder / f"user_{user_id}"
            else:
                folder_path = self.base_dir / folder

            # Garantir que o diretório existe
            folder_path.mkdir(parents=True, exist_ok=True)

            # Caminho completo do arquivo
            file_path = folder_path / unique_filename

            # Salvar arquivo
            content = await file.read()
            with open(file_path, "wb") as f:
                f.write(content)

            # Resetar o ponteiro do arquivo
            await file.seek(0)

            # Construir URL relativa (será servido pelo NGINX)
            if user_id:
                relative_url = f"/uploads/{folder}/user_{user_id}/{unique_filename}"
            else:
                relative_url = f"/uploads/{folder}/{unique_filename}"

            return relative_url

        except Exception as e:
            print(f"Erro ao salvar arquivo localmente: {e}")
            raise HTTPException(
                status_code=500, detail=f"Erro ao fazer upload do arquivo: {str(e)}"
            )

    async def delete_file(self, file_url: str) -> bool:
        """
        Deleta um arquivo local

        Args:
            file_url: URL relativa do arquivo

        Returns:
            True se deletado com sucesso
        """
        try:
            # Extrair caminho relativo da URL
            # URL format: /uploads/folder/filename
            if not file_url.startswith("/uploads/"):
                return False

            # Remover /uploads/ do início
            relative_path = file_url.replace("/uploads/", "", 1)
            file_path = self.base_dir / relative_path

            # Verificar se o arquivo existe e está dentro do diretório base
            if file_path.exists() and file_path.is_relative_to(self.base_dir):
                file_path.unlink()
                return True

            return False

        except Exception as e:
            print(f"Erro ao deletar arquivo local: {e}")
            return False

    async def upload_profile_picture(self, file: UploadFile, user_id: int) -> str:
        """Upload de foto de perfil de usuário"""
        return await self.upload_file(file, "profile-pictures", user_id)

    async def upload_student_document(self, file: UploadFile, student_id: int) -> str:
        """Upload de documento de aluno"""
        return await self.upload_file(file, "student-documents", student_id)

    async def upload_educational_material(self, file: UploadFile) -> str:
        """Upload de material educativo"""
        return await self.upload_file(file, "educational-materials")


# Instância global do serviço de armazenamento local
local_storage_service = LocalStorageService()
