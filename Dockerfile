FROM lambci/lambda:build-nodejs12.x

WORKDIR /tmp

ENV AWS_EXECUTION_ENV=AWS_Lambda_python3.8 \
    PYTHONPATH=/var/runtime

#install python dependencies

RUN curl --silent --show-error --retry 5 https://bootstrap.pypa.io/get-pip.py | python3.7 && \
  pip install -U pip setuptools --no-cache-dir && \
  pip install -U virtualenv pipenv --no-cache-dir && \
  curl https://lambci.s3.amazonaws.com/fs/python3.8.tgz | tar -zx -C /

WORKDIR /build
