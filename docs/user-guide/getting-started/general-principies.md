# General Principies

For a comprehensive understanding of how the database processing occurs, we recommend reading the article linked below. As a brief overview, the processing involves three main components, as outlined in the [Getting Started](./) page:

1. **Service (VeilDB UI):** This is the public website where you manage rules.
2. **Server (VeilDB Agent):** A private application installed on your server that processes the database.
3. **Client (VeilDB Client):** Another private application that developers install on their computers to download the database.

Now, let's delve into the server side (VeilDB Agent) and how it processes the database:

1. **Installation and Linking:** After installing the application on your server and linking it with the service (refer to the [**Installation**](installation.md) section), you need to add a new database and configure it (see [Database Management](../dbvisor-agent/database-management.md) section).
2. **Database Configuration:** Once a database is added, you can configure rules on the service and specify them accordingly.
3. **Processing Workflow:** The VeilDB Agent sends a request to the service to check if there is a scheduled database, as per the rules defined on the service. If a scheduled database is found, it initiates the processing. The processing workflow is as follows:
   * Attempt to obtain a backup from the specified source (see Dump Methods section) and download/dump it.
   * After the download/dump is completed, it creates a temporary database on the internal DB server.
   * The backup is then imported into this temporary database.
   * The processing of rules is initiated.
   * A dump is created from the temporary database.
   * The temporary database is dropped.
4. **Key Points:**
   * Database processing is not parallel, meaning that while one database is processing, another scheduled database goes into the queue.
   * The VeilDB Agent sends reports and logs to the service, which can be viewed at the database edit page on the service side.

![The diagram that explains the general life cycle of processing databases](<../../.gitbook/assets/DB (2).jpg>)
