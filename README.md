# puppeteer
A GUNet puppeteer Docker image

**Important**: This is a work in progress

# References
* Puppeteer [documentation](https://pptr.dev/guides/docker)
* Reference [Dockerfile](https://github.com/puppeteer/puppeteer/blob/main/docker/Dockerfile)

# Documentation
## Main Library
* File: `gunet.js`

## Usage
* Environment variables
  - `CAS_USER`: Username (default `gunetdemo`)
  - `CAS_PASSWORD`: Password (default `gunetdemo`)
* Show module version: `docker run --rm ghcr.io/gunet/puppeteer npm list`
* General Run: `docker run -it --cap-add=SYS_ADMIN --rm ghcr.io/gunet/puppeteer node --unhandled-rejections=strict <scenario + args>`
* Specific scenarios:
  - `cas`: `./login.js <SSO BASE URL>`
* Arguments
  - `<SSO BASE URL>`: An example might be `https://sso.uoi.gr` or `https://worker-01.dev.gunet.gr:8443/cas` (in the case of `simple-cas`)

# Size
* Disk size: `1.17 GB`