# Installation

## Installation

## Service Installation

At the beginning, it is required to install the service at [ https://github.com/dbvisor-pro/veildb](https://github.com/dbvisor-pro/veildb).

It can be done easily by executing `install.sh` a script.

Then you must create an account.

## **Server Side Configuration**

### Preparing environment

Ensure that all the necessary software is installed before proceeding with the installation.

**Requirements**:

* Docker
* curl
* lsof

1. To install Docker, refer to the official documentation: [Docker Installation Guide](https://docs.docker.com/engine/install/).
2.  For curl and lsof installation, execute the following commands based on your operating system:

    ```bash
    ## For Debian
    sudo apt update && sudo apt install curl lsof zip

    ## For Alpine
    sudo apk add curl lsof zip
    ```
3.  The next step involves installing the VeilDB Agent. Execute the following command:

    ```bash
    ## For alpine
    curl https://veildb.com/download/veildb-agent-install | sh

    ## For debian
    curl https://veildb.com/download/veildb-agent-install | bash
    source ~/.bashrc
    ```

{% hint style="warning" %}
**Important Note:** During the installation, you will be prompted for Docker installation. It is strongly recommended to use Docker. Non-Docker installation requires additional configurations on your end
{% endhint %}

### Configurations

1.  Add new server:

    ```bash
    dbvisor-agent app:server:add
    ```
2. Enter your email, password, and workspace code.
3. Enter server name

After you add a new server, you can set up a new Database. Go to [Database Management](../dbvisor-agent/database-management.md) to get more information on how to add and manage your databases.

4. Also, you can configure access to

## Client side

You can download the latest version of the client from one of the links below:

* **Linux**: [https://veildb.com/download/veildb-linux-amd64-latest.zip](https://veildb.com/download/veildb-linux-amd64-latest.zip)
* **Mac AMD:** [https://veildb.com/download/veildb-darwin-amd64-latest.zip](https://veildb.com/download/veildb-darwin-amd64-latest.zip)
* **Mac ARM**: [https://veildb.com/download/veildb-darwin-arm64-latest.zip](https://veildb.com/download/veildb-darwin-arm64-latest.zip)
* **Windows**: [https://veildb.com/download/veildb-windows-amd64-latest.zip](https://veildb.com/download/veildb-windows-amd64-latest.zip)







* [How to generate keypair](../dbvisor-agent/generate-key-pairs.md)
* [How to save locally public key](../dbvisor-client/save-public-key.md)
