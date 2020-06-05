From tomcat:7.0
RUN rm -d webapps && mv webapps.dist webapps 
COPY TestProject/target/TestProject-3.4.0-SNAPSHOT.war /usr/local/tomcat/webapps/Engine.war
COPY rules/ /usr/local/tomcat/webapps/rules/
CMD ["catalina.sh", "run"]
