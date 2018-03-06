# Slack Webhook Integration Demo

This is a basic web application to show an integration with Slack and Volare's Webhooks.

## Settings Window

## Requirements

 - app must be reachable from the users connected to splashportal
 - mysql database (init structure is under /sql path)
 - redis cache

## Configuration

| Variable      | default value | 
| ------------- | ------------- 
| MYSQL_HOST    | n/a
| MYSQL_USER    | n/a
| MYSQL_PASS    | n/a
| MYSQL_MAX_CONNECTIONS | 10
| SLACK_CLIENT_ID | n/a
| SLACK_CLIENT_SECRET | n/a

Slack Client ID and Slack Client Secret can be found and changed on the [Slack App Website](https://api.slack.com/apps)

## Running

### Dev

    $ docker-compose up -d

Thre containers starts, one for the webapp, one for the mysql server, and one for the redis cache. 

The port of the webapp is randomly choosen, changes on each restart.

    $ docker-compose ps

        Name                  Command               State                    Ports
    ------------------------------------------------------------------------------------------------
    app-slackwebhook   pm2 start process...   Up      443/tcp, 0.0.0.0:32790->80/tcp, 9000/tcp
    ________________________________________________________________________________

Open in browser http://localhost:32790

Find webserver logs

    $ docker-compose logs -f web
  app-slackwebhook | 2017-12-20 00:27:26: [--no-daemon] Continue to stream logs
  app-slackwebhook | 2017-12-20 00:27:26: [--no-daemon] Exit on target PM2 exit pid=1
