from .turma import TurmaSerializer
from .avaliacao import AvaliacaoClienteSerializer, AvaliacaoPublicaSerializer, AvaliacaoSerializer
from .material_curso import MaterialCursoSerializer
from .produto import ProdutoSerializer, ProdutoPublicoSerializer
from .agendamento import AgendamentoSerializer
from .matricula import MatriculaSerializer
from .curso import CursoSerializer
from .servico import ServicoSerializer
from .usuario import UsuarioSerializer
from .cestinha_interesse import CestinhaInteresseSerializer
from .cliente_serializer import ClienteSerializer
from .promocao import PromocaoSerializer
from .configuracao_studio import ConfiguracaoStudioSerializer

__all__ = [
    'ClienteSerializer',
    'PromocaoSerializer',
    'ConfiguracaoStudioSerializer',
]