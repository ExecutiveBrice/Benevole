# we will use openjdk 8 with alpine as it is a very small linux distro
FROM openjdk:8-jre-alpine3.9
# copy the packaged jar file into our docker image
COPY ./benevoles.jar /benevoles.jar
COPY ./application.yml /resources/application.yml

CMD ls -lrt
# set the startup command to execute the jar
CMD ["java", "-jar", "/benevoles.jar", "--spring.config.location=/resources/application.yml"]


