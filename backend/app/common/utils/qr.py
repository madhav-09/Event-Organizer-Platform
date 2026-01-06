import qrcode
from io import BytesIO

def generate_qr(data: str):
    qr = qrcode.make(data)
    buffer = BytesIO()
    qr.save(buffer)
    buffer.seek(0)
    return buffer
