# utils/email_parser.py
import re
from typing import Tuple, Optional

class EmailParser:
    """Utilitário para parsear emails"""
    
    @staticmethod
    def extract_email_and_name(raw_email: str) -> Tuple[str, Optional[str]]:
        """
        Extrai email e nome de strings como:
        - "FELIPE SILVA <fs0987145@gmail.com>"
        - "fs0987145@gmail.com"
        - "<fs0987145@gmail.com>"
        
        Agora, se vier apenas um email, gera automaticamente um nome:
        fs0987145@gmail.com → FS
        """

        # 1) Padrão: Nome <email@exemplo.com>
        pattern_with_name = r'([^<]*?)\s*<([^>]+)>'
        match = re.search(pattern_with_name, raw_email)

        if match:
            nome = match.group(1).strip().strip('"')
            email = match.group(2).strip()
            print("1",email, nome )
            return (email, nome if nome else None)

        # 2) Padrão: apenas email
        pattern_email_only = r'([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})'
        match = re.search(pattern_email_only, raw_email)

        if match:
            email = match.group(1).strip()

            # Geração automática do nome a partir das duas primeiras letras
            prefix = email.split("@")[0][:2]  # primeiras duas letras antes do @
            nome_auto = prefix.upper() if prefix else None
            print("2",email, nome_auto )
            return (email, nome_auto)

        # 3) Se não encontrar nada, retorna o raw mesmo
        return (raw_email.strip(), None)