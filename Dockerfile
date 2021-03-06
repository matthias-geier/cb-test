FROM ruby:2.3.1-slim

RUN apt-get update
RUN apt-get install -y nodejs npm gzip
RUN npm install -g npm
RUN ln -s /usr/bin/nodejs /usr/bin/node
RUN npm install -g react-tools

ENV rootdir=/cb-test
WORKDIR $rootdir

ADD Gemfile $rootdir/
ADD Gemfile.lock $rootdir/
RUN bundle
ADD . $rootdir/

RUN jsx -x jsx jsx/ files/
RUN cd files; gzip -k *.js *.css; cd fonts; gzip -k *
CMD bundle exec puma -C puma.rb -b tcp://0.0.0.0:3000
