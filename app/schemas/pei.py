from pydantic import BaseModel
from typing import Optional
from datetime import date, datetime


class PEIBase(BaseModel):
    aluno_id: int
    elaborado_por_id: Optional[int] = None
    data_inicio: date
    data_fim: Optional[date] = None
    objetivos: str
    adaptacoes_curriculares: Optional[str] = None
    estrategias_ensino: Optional[str] = None
    recursos_necessarios: Optional[str] = None
    criterios_avaliacao: Optional[str] = None
    observacoes: Optional[str] = None


class PEICreate(PEIBase):
    pass


class PEIUpdate(BaseModel):
    data_inicio: Optional[date] = None
    data_fim: Optional[date] = None
    objetivos: Optional[str] = None
    adaptacoes_curriculares: Optional[str] = None
    estrategias_ensino: Optional[str] = None
    recursos_necessarios: Optional[str] = None
    criterios_avaliacao: Optional[str] = None
    observacoes: Optional[str] = None
    ativo: Optional[int] = None


class PEIResponse(PEIBase):
    id: int
    ativo: int
    criado_em: datetime
    atualizado_em: Optional[datetime] = None
    
    class Config:
        from_attributes = True


class IntervencaoPedagogicaBase(BaseModel):
    pei_id: int
    professor_id: Optional[int] = None
    data_intervencao: date
    tipo_intervencao: Optional[str] = None
    descricao: str
    resultados_observados: Optional[str] = None
    proximos_passos: Optional[str] = None


class IntervencaoPedagogicaCreate(IntervencaoPedagogicaBase):
    pass


class IntervencaoPedagogicaResponse(IntervencaoPedagogicaBase):
    id: int
    criado_em: datetime
    
    class Config:
        from_attributes = True

