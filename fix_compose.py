content = open('/opt/sensu/docker-compose.yml').read()
old = '      - CLOUDINARY_CLOUD_NAME=\n      - CLOUDINARY_API_KEY=\n      - CLOUDINARY_API_SECRET='
new = (
    '      - CLOUDINARY_CLOUD_NAME=${CLOUDINARY_CLOUD_NAME}\n'
    '      - CLOUDINARY_API_KEY=${CLOUDINARY_API_KEY}\n'
    '      - CLOUDINARY_API_SECRET=${CLOUDINARY_API_SECRET}'
)
if old not in content:
    print('marker not found, current state:')
    print([l for l in content.split('\n') if 'CLOUDINARY' in l])
else:
    open('/opt/sensu/docker-compose.yml', 'w').write(content.replace(old, new))
    verify = open('/opt/sensu/docker-compose.yml').read()
    print([l.strip() for l in verify.split('\n') if 'CLOUDINARY' in l])
