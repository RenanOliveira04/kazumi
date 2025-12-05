"""
Serviço para upload e gerenciamento de arquivos no AWS S3
"""

import boto3
from botocore.exceptions import ClientError
from fastapi import UploadFile, HTTPException
from typing import Optional
import uuid
import os
from app.config import settings


class S3Service:
    """Serviço para interagir com AWS S3"""

    def __init__(self):
        self.s3_client = None
        self.bucket_name = settings.S3_BUCKET_NAME
        self._initialize_client()

    def _initialize_client(self):
        """Inicializa o cliente S3 se as credenciais estiverem disponíveis"""
        if settings.AWS_ACCESS_KEY_ID and settings.AWS_SECRET_ACCESS_KEY:
            try:
                self.s3_client = boto3.client(
                    "s3",
                    aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
                    aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
                    region_name=settings.AWS_REGION,
                )
            except Exception as e:
                print(f"Erro ao inicializar S3 client: {e}")
        else:
            print("Credenciais AWS não configuradas. S3 não disponível.")

    def _is_available(self) -> bool:
        """Verifica se o serviço S3 está disponível"""
        return self.s3_client is not None

    async def upload_file(
        self, file: UploadFile, folder: str, user_id: Optional[int] = None
    ) -> str:
        """
        Faz upload de um arquivo para o S3

        Args:
            file: Arquivo para upload
            folder: Pasta no S3 (ex: 'profile-pictures', 'student-documents')
            user_id: ID do usuário (opcional, usado para organizar arquivos)

        Returns:
            URL pública do arquivo no S3
        """
        if not self._is_available():
            raise HTTPException(
                status_code=503, detail="Serviço de armazenamento não disponível"
            )

        try:
            # Gerar nome único para o arquivo
            file_extension = os.path.splitext(file.filename)[1]
            unique_filename = f"{uuid.uuid4()}{file_extension}"

            # Construir caminho no S3
            if user_id:
                s3_key = f"{folder}/user_{user_id}/{unique_filename}"
            else:
                s3_key = f"{folder}/{unique_filename}"

            # Fazer upload
            self.s3_client.upload_fileobj(
                file.file,
                self.bucket_name,
                s3_key,
                ExtraArgs={
                    "ContentType": file.content_type,
                    "ACL": "public-read",  # Tornar arquivo público
                },
            )

            # Construir URL pública
            url = f"https://{self.bucket_name}.s3.{settings.AWS_REGION}.amazonaws.com/{s3_key}"
            return url

        except ClientError as e:
            print(f"Erro ao fazer upload para S3: {e}")
            raise HTTPException(
                status_code=500, detail=f"Erro ao fazer upload do arquivo: {str(e)}"
            )
        except Exception as e:
            print(f"Erro inesperado no upload: {e}")
            raise HTTPException(
                status_code=500, detail="Erro ao processar upload do arquivo"
            )

    async def delete_file(self, file_url: str) -> bool:
        """
        Deleta um arquivo do S3

        Args:
            file_url: URL completa do arquivo no S3

        Returns:
            True se deletado com sucesso
        """
        if not self._is_available():
            return False

        try:
            # Extrair a chave S3 da URL
            s3_key = file_url.split(
                f"{self.bucket_name}.s3.{settings.AWS_REGION}.amazonaws.com/"
            )[1]

            self.s3_client.delete_object(Bucket=self.bucket_name, Key=s3_key)
            return True

        except (ClientError, IndexError) as e:
            print(f"Erro ao deletar arquivo do S3: {e}")
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


# Instância global do serviço S3
s3_service = S3Service()
