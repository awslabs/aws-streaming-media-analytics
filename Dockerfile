FROM lambci/lambda:build-nodejs8.10

WORKDIR /tmp

ENV AWS_EXECUTION_ENV=AWS_Lambda_python2.7 \
    PYTHONPATH=/var/runtime

#install python dependencies

RUN curl --silent --show-error --retry 5 https://bootstrap.pypa.io/get-pip.py | python && \
  pip install -U pip setuptools --no-cache-dir && \
  pip install -U virtualenv pipenv --no-cache-dir && \
  curl https://lambci.s3.amazonaws.com/fs/python2.7.tgz | tar -zx -C /

WORKDIR /build
