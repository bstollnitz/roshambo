# Introduction

This project contains code for a typical end-to-end AI scenario using Azure ML, PyTorch, MLflow, PyTorch Lightning, an Azure Static Web App, and an Azure Function. It captures a photo of the user's hand in the shape of "rock" (a fist), "paper" (a flat palm), or "scissors" (a V shape), and uses deep learning to classify it.


# Setup

* Fork this GitHub project.

* Create a new conda environment for this project based on the requirements file provided:

    ```sh
    conda create -n roshambo python=3.9
    conda activate roshambo
    cd ai
    pip install requirements.txt
    ```

* Add GitHub secrets to your GitHub repo fork. Go to the main page of your GitHub project, click on "Settings," then on "Secrets" on the left panel, and on "Actions." Click on "New repository secret" to create each of the following secrets:

    * Name: AZURE_TOKEN
    
      Secret: Copy the results of the following command, taking care to replace the placeholders with your Azure subscription and resource group.

        ```sh
        az ad sp create-for-rbac --name "roshambo" --role contributor \
        --scopes /subscriptions/<YOUR-SUBSCRIPTION>/resourceGroups/<YOUR-RESOURCE-GROUP> \
        --sdk-auth
        ```

    * Name: AML_WORKSPACE

      Secret: \<YOUR-WORKSPACE>

    * Name: AML_RG

      Secret: \<YOUR-RESOURCE-GROUP> 


# Train and test your model on your local machine

* Click on the "Run and Debug" section in the VS Code left navigation, and select "PL Trainer" from the drop down menu. Press F5. This trains a deep learning model to classify images on your local machine. It will take a few minutes and several epochs to get the results. Once done, you can check that the last epoch in the logs should have validation accuracy close to 1.

* Now select "PL Tester" from the same drop down menu and press F5. This tests your local deep learning model. If everything is working as expected, test accuracy should also be close to 1.


# Train, test, and deploy your model in the cloud

Once you get a good result in your local test, it's time to move your training to the cloud. Here are the steps to move your code to the cloud:

  * Create a data source:

    ```sh
    az ml data create -f cloud/dataset.yml
    ```

  * Create the training environment:

    ```sh
    az ml environment create -f cloud/environment/environment.yaml
    ```

  * Create the deployment environment:

    ```sh
    az ml environment create -f cloud/environment/environment_deploy.yaml
    ```

  * Trigger the GitHub action that trains and deploys the model by navigating to your repo on the GitHub web site, clicking on "Actions," then on the "roshambo.ai - training" workflow, and finally on the "Run workflow" button. This creates a job that trains the model, registers the model, and creates an endpoint and deployment. It will take several minutes to complete.

  * Once the action has completed, you can look at the cloud training job by going to the [Azure ML Studio](https://ml.azure.com/), clicking on "Jobs" and then on the "roshambo" experiment. The top job is the latest one &mdash; hopefully its status is "Completed." Notice the training and validation loss charts. You can verify that your model was registered by clicking on "Models" on the left navigation, and making sure that "roshambo-model" is listed. 

  * You can take a look at the endpoint created by the workflow by going to "Endpoints" on the left navigation &mdash; the endpoint name is "roshambo-endpoint." Click on it, then click on the "Test" tab. You should see a reference to an image already added as input to the test. Click on the "Test" button. The result of classifying the image should be "scissors."


# Run the web app locally

* Find the endpoint URL and key by going to the [Azure ML Studio](https://ml.azure.com/), clicking on "Endpoints," then on "roshambo-endpoint," and then on "Consume." The endpoint URL is under "REST endpoint" and its key is under "Authentication - Primary key." 

* Run the following commands in your terminal:

  ```sh
  cd web
  env INFERENCE_ENDPOINT=<ENDPOINT-URL> INFERENCE_KEY=<ENDPOINT-KEY> yarn dev
  ```

* Navigate to `http://localhost:3000` in your browser to see the app.

* Selec a camera from the drop-down menu, make a rock, paper, or scissors shape with your hand, and click on the Submit button to take the photo. A few seconds later, the prediction should appear on the right-hand side of the page.


# Setup the web app

* Delete the file `.github.workflows/azure-static-web-apps-agreeable-water-07abd741e.yml` file. This is the workflow that deploys the web app using my secret token, which you don't have access to!

* Create your own "Static Web App" resource on the [Azure portal](https://ms.portal.azure.com/#), with the following details:
  * Name: roshambo
  * Plan type: Free
  * Deployment details - source: GitHub
  * Build presets: Next.js
  * App location: /web
  * Api location: /api
  * Output location: out

* Add information about your endpoint URL and key to your web app. On the static web app page, click on "Configuration" and add the following "Application settings" using the endpoint URL and key you got earlier:
  * Name: INFERENCE_ENDPOINT
  
    Value: \<ENDPOINT-URL>

  * Name: INFERENCE_KEY
  
    Value: \<ENDPOINT-KEY>

* A new workflow should be added to your `.github/workflows` directory, and a new secret should be added to your GitHub repo's secrets. Open your new workflow, and replace the `on` section with the following:

  ```yml
  on:
    workflow_dispatch:
    push:
      branches:
        - main
      paths:
        - 'api/**'
        - 'web/**'
    pull_request:
      types: [opened, synchronize, reopened, closed]
      branches:
        - main
      paths:
        - 'api/**'
        - 'web/**'
  ```

  The `workflow_dispatch` line enables the GitHub workflow to be triggered manually from your GitHub repo, and the `paths` ensure that the workflow runs automatically only when you make changes to the web code (and *not* when you make changes to your ML or Azure ML code).


# Deploy and run the web app

* Go to your GitHub repo, click on "Actions," and then on the "Azure Static Web Apps CI/CD" workflow you just created. Then click on the "Run workflow" button to trigger the action.

* Go to the Azure portal, find the static web app you just created, click on it, and then click on the link next to "URL." This should open the app in the browser.


# Delete the endpoint

Once you're done playing with the endpoint, make sure you delete it, which can be done in the "Endpoints" page in the Studio. This avoids unnecessary charges.

