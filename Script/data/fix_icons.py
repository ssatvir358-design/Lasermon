import re

with open('C:/Users/Utente/Desktop/sito laser poke/Script/data/oggetti.js', 'r', encoding='utf-8') as f:
    content = f.read()

mapping = {
    "CAFFE' ALLA MACCHINETTA": "comprabili/caffe_macchinetta.png",
    "ENERGY DRINK": "comprabili/energy_drink.png",
    "SHAKE PROTEICO": "comprabili/shake_proteico.png",
    "INTEGRATORE AVANZATO": "comprabili/integratore_avanzato.png",
    "SNACK AL VOLO": "comprabili/snack_al_volo.png",
    "TRANCIO DI PIZZA": "comprabili/trancio_pizza.png",
    "ACQUA FRESCA": "comprabili/acqua_fresca.png",
    "KEBAB": "comprabili/kebab.png",
    "CREATINA": "comprabili/creatina.png",
    "GRIGLIATA AZIENDALE": "comprabili/grigliata_aziendale.png",
    "CONTRATTO DETERMINATO": "comprabili/contratto_determinato.png",
    "BRACCIALE LASER": "non comprabili/bracciale_laser.png",
    "ANELLO DEL LEONE": "non comprabili/anello_leone.png",
    "T-SHIRT LASER": "non comprabili/tshirt_laser.png",
    "CIABATTE BIRK": "non comprabili/ciabatte_birk.png",
    "CINTURA DEL RESPONSABILE": "non comprabili/cintura_responsabile.png",
    "SPADA DEL LEONE": "non comprabili/spada_leone.png",
    "SCUDO LASER": "non comprabili/scudo_laser.png",
    "TACCHI DELLA LEONESSA": "non comprabili/tacchi_leonessa.png",
    "CAPPELLO LASER": "non comprabili/cappello_laser.png",
    "LANCIA DIVINA DEL LEONE": "non comprabili/lancia_leone.png",
    "SCARPE ANTI-INFORTUNISTICHE": "non comprabili/scarpe_antinfortunio.png",
    "INFRADITO AMMINISTRATIVO": "non comprabili/infradito_amministrativo.png",
    "CAFFE' LUNGO DELLA MACCHINETTA": "non comprabili/caffe_lungo.png",
    "FOGLIO DI PERMESSO": "non comprabili/foglio_permesso.png",
    "MAIL DI SOLLECITO": "non comprabili/mail_sollecito.png",
    "SMARTPHONE": "non comprabili/smartphone.png",
    "THE' DELLA MACCHINETTA": "non comprabili/the_macchinetta.png",
    "GIUBBINO LASER": "non comprabili/giubbino_laser.png",
    "TABELLONE TICKET": "non comprabili/tabellone_ticket.png",
    "AUTO AZIENDALE": "non comprabili/auto_aziendale.png",
    "TESSERA DEL SINDACATO": "non comprabili/tessera_sindacato.png",
    "CONTRATTO INTERDERMINATO": "non comprabili/contratto_indeterminato.png",
    "CORNETTO DELLA RECEPTION (MALEDETTO)": "non comprabili/cornetto_reception.png",
    "SEDIA ERGONOMICA (MALEDETTO)": "non comprabili/sedia_ergonomica.png",
    "BONUS STRAORDINARIO (MALEDETTO)": "non comprabili/bonus_straordinario.png"
}

lines = content.split('\n')
for i in range(len(lines)):
    if 'nome: "' in lines[i]:
        # get name
        m = re.search(r'nome: "(.*?)"', lines[i])
        if m:
            nome = m.group(1)
            if nome in mapping:
                # replace next icona line
                for j in range(i+1, i+10):
                    if 'icona: ' in lines[j]:
                        lines[j] = f'        icona: "../Sprite/item/{mapping[nome]}",'
                        break

with open('C:/Users/Utente/Desktop/sito laser poke/Script/data/oggetti.js', 'w', encoding='utf-8') as f:
    f.write('\n'.join(lines))
