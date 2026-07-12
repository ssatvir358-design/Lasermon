import json

consumabili_raw = """
CAFFE' ALLA MACCHINETTA	2	1-2	RECUPERI 20 PV
ENERGY DRINK	5	3-4	RECUPERI 150 PV
SHAKE PROTEICO	10	5-6-7	RECUPERI 300 PV
INTEGRATORE AVANZATO	12	8-9	RECUPERI 450 PV
SNACK AL VOLO	3	3-4	RECUPERI IL 20% DEI PV MASSIMI
TRANCIO DI PIZZA	7	3-4	RECUPERI IL 40% DEI PV MASSIMI
ACQUA FRESCA	6	3-4	RECUPERI 50 PV E RIMUOVE LO STATUS BRUCIATURA
KEBAB	12	5-6-7	RECUPERI IL 60% DEI PV MASSIMI
CREATINA	10	5-6-7	RECUPERI 150 PV E RIMUOVE TUTTI I DEBUFF
GRIGLIATA AZIENDALE	25	8-9	RECUPERI IL 100% E TOGLIE QUALSIASI DEBUFF E ALTERAZIONE DELLE STATISTICHE
CONTRATTO DETERMINATO	15	7-9	IN BATTAGLIA, AUMENTA ATK 20% PER 3 TURNI
"""

equip_raw = """
BRACCIALE LASER	1-3	CONFERISCE +20PV
ANELLO DEL LEONE	1-3	CONFERISCE +8 ATK
T-SHIRT LASER	1-3	CONFERISCE +6 DEF
CIABATTE BIRK	1-3	CONFERISCE +6 SPD
CINTURA DEL RESPONSABILE	4-6	CONFERISCE +50 PV
SPADA DEL LEONE	4-6	CONFERISCE +22 ATK
SCUDO LASER	4-6	CONFERISCE +25 DEF
TACCHI DELLA LEONESSA	4-6	CONFERISCE +20 SPD
CAPPELLO LASER	7-9	CONFERISCE +120 PV
LANCIA DIVINA DEL LEONE	7-9	CONFERISCE +60 ATK
SCARPE ANTI-INFORTUNISTICHE	7-9	CONFERISCE +70 DEF
INFRADITO AMMINISTRATIVO	7-9	CONFERISCE +40 SPD
CAFFE' LUNGO DELLA MACCHINETTA	1-3	AUMENTA I PV MASSIMI DEL 10%
FOGLIO DI PERMESSO	1-3	AUMENTA LA DIFESA DEL 10%
MAIL DI SOLLECITO	1-3	AUMENTA L'ATK DEL 10%
SMARTPHONE	1-3	AUMENTA SPD DEL 10%
THE' DELLA MACCHINETTA	4-6	AUMENTA I PV MASSIMI DEL 15%
GIUBBINO LASER	4-6	AUMENTA LA DEF DEL 15%
TABELLONE TICKET	4-6	AUMENTA L'ATK DEL 15%
AUTO AZIENDALE	4-6	AUMENTA LA SPD DEL 15%
TESSERA DEL SINDACATO	7-9	AUMENTA I PV I LA DEF DEL 20%
CONTRATTO INTERDERMINATO	7-9	AUMENTA L'ATK E LA SPD DEL 25%
CORNETTO DELLA RECEPTION (MALEDETTO)	4-6	AUMENTO +20PV MASSIMO E -15 SPD
SEDIA ERGONOMICA (MALEDETTO)	7-9	AUMENTA +30% DIFSA E -20% SPD
BONUS STRAORDINARIO (MALEDETTO)	7-9	AUMENTA +30% ATK E -20% DEF
"""

db = []

def parse_mappe(m_str):
    parts = m_str.split('-')
    if len(parts) == 2:
        start, end = int(parts[0]), int(parts[1])
        return list(range(start, end+1))
    elif ',' in m_str:
        return [int(x) for x in m_str.split(',')]
    else:
        return [int(p) for p in parts if p.isdigit()]

# Process consumabili
for i, line in enumerate(consumabili_raw.strip().split('\n')):
    parts = line.split('\t')
    if len(parts) < 4: continue
    nome, costo, mappe, effetto = parts
    
    valore = 0
    valoreType = "flat"
    stat = "hp"
    effettoSpeciale = "null"
    durataInTurni = "null"
    
    if "%" in effetto:
        valoreType = "percent"
        if "20%" in effetto: valore = 0.20
        if "40%" in effetto: valore = 0.40
        if "60%" in effetto: valore = 0.60
        if "100%" in effetto: valore = 1.00
    else:
        if "20 PV" in effetto: valore = 20
        elif "50 PV" in effetto: valore = 50
        elif "150 PV" in effetto: valore = 150
        elif "300 PV" in effetto: valore = 300
        elif "450 PV" in effetto: valore = 450
        
    if "BRUCIATURA" in effetto: effettoSpeciale = '"rimuovi_bruciatura"'
    if "DEBUFF" in effetto: effettoSpeciale = '"rimuovi_tutto"' # GRIGLIATA o CREATINA
    
    if "ATK" in effetto and "TURNI" in effetto:
        stat = "atk"
        valore = 0.20
        valoreType = "percent"
        effettoSpeciale = '"atk_boost_temporaneo"'
        durataInTurni = "3"
        
    item = f"""    {{
        id: "cons_{i}",
        nome: "{nome}",
        icona: "../Sprite/nodi/item.png",
        iconaFallback: "💊",
        mappeAbilitate: {parse_mappe(mappe)},
        descrizione: "{effetto}",
        categoria: "consumabile",
        acquistabile: true,
        stat: "{stat}",
        valore: {valore},
        valoreType: "{valoreType}",
        costo: {costo},
        consumabile: true,
        effettoSpeciale: {effettoSpeciale},
        usabileInBattaglia: true,
        limiteUtilizziPerFight: null,
        durataInTurni: {durataInTurni}
    }}"""
    db.append(item)

# Process equipaggiabili
for i, line in enumerate(equip_raw.strip().split('\n')):
    parts = line.split('\t')
    if len(parts) < 3: continue
    nome, mappe, effetto = parts
    
    stat = "hp"
    valore = 0
    valoreType = "flat"
    maledetto = "MALEDETTO" in nome
    
    # parse base stats
    effetto_upper = effetto.upper()
    if "PV" in effetto_upper or "HP" in effetto_upper: stat = "hp"
    if "ATK" in effetto_upper: stat = "atk"
    if "DEF" in effetto_upper or "DIFESA" in effetto_upper or "DIFSA" in effetto_upper: stat = "def"
    if "SPD" in effetto_upper or "VEL" in effetto_upper: stat = "vel"
    
    if "%" in effetto:
        valoreType = "percent"
        if "10%" in effetto: valore = 0.10
        if "15%" in effetto: valore = 0.15
        if "20%" in effetto: valore = 0.20
        if "25%" in effetto: valore = 0.25
        if "30%" in effetto: valore = 0.30
    else:
        import re
        nums = re.findall(r'\d+', effetto)
        if nums: valore = int(nums[0])
        
    extra_fields = ""
    # parse double stats for normal items
    if "PV E LA DEF" in effetto_upper or "PV I LA DEF" in effetto_upper: # TESSERA DEL SINDACATO
        stat = "hp"
        extra_fields = f"""
        bonusStatistica: "def",
        bonusValore: {valore},
        bonusValoreType: "{valoreType}","""
    if "ATK E LA SPD" in effetto_upper: # CONTRATTO INTERDERMINATO
        stat = "atk"
        extra_fields = f"""
        bonusStatistica: "vel",
        bonusValore: {valore},
        bonusValoreType: "{valoreType}","""

    if maledetto:
        if "PV" in effetto_upper and "SPD" in effetto_upper:
            stat = "hp"
            valore = 20
            valoreType = "flat"
            extra_fields = f"""
        malusStatistica: "vel",
        malusValore: -15,
        malusValoreType: "flat","""
        elif "DIFSA" in effetto_upper and "SPD" in effetto_upper:
            stat = "def"
            valore = 0.30
            valoreType = "percent"
            extra_fields = f"""
        malusStatistica: "vel",
        malusValore: -0.20,
        malusValoreType: "percent","""
        elif "ATK" in effetto_upper and "DEF" in effetto_upper:
            stat = "atk"
            valore = 0.30
            valoreType = "percent"
            extra_fields = f"""
        malusStatistica: "def",
        malusValore: -0.20,
        malusValoreType: "percent","""
        
    maledetto_str = "true" if maledetto else "false"
    
    item = f"""    {{
        id: "equip_{i}",
        nome: "{nome}",
        icona: "../Sprite/nodi/item.png",
        iconaFallback: "🎒",
        mappeAbilitate: {parse_mappe(mappe)},
        descrizione: "{effetto}",
        categoria: "equipaggiabile",
        acquistabile: false,
        stat: "{stat}",
        valore: {valore},
        valoreType: "{valoreType}",
        costo: 0,
        consumabile: false,
        effettoSpeciale: null,
        usabileInBattaglia: false,
        limiteUtilizziPerFight: null,
        durataInTurni: null,{extra_fields}
        spawnPerc: null,
        itemSpeciale: {maledetto_str},
        raritaItem: "comune",
        maledetto: {maledetto_str}
    }}"""
    db.append(item)


output = "// ==========================================================\\n"
output += "// oggetti.js — Database completo di tutti gli oggetti del gioco\\n"
output += "// ==========================================================\\n\\n"
output += "const DB_OGGETTI = [\\n"
output += ",\\n".join(db)
output += "\\n];\\n"

with open("C:/Users/Utente/Desktop/sito laser poke/Script/data/oggetti.js", "w", encoding="utf-8") as f:
    f.write(output)
