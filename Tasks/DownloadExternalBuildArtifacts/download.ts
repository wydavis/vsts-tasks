var path = require('path')
var url = require('url')

import * as tl from 'vsts-task-lib/task';
import { WebApi, getHandlerFromToken } from 'vso-node-api/WebApi';

import * as models from "item-level-downloader/Models"
import * as engine from "item-level-downloader/Engine"
import * as providers from "item-level-downloader/Providers"

tl.setResourcePath(path.join(__dirname, 'task.json'));

async function main(): Promise<void> {
    let connection = tl.getInput("connection", true);
    let projectId = tl.getInput("project", true);
    let definitionId = tl.getInput("definition", true);
    let buildId = tl.getInput("version", true);
    let downloadPattern = tl.getInput("downloadPattern", true);
    let downloadPath = tl.getInput("downloadPath", true);

    var endpointUrl = tl.getEndpointUrl(connection, false);
    var accessToken = tl.getEndpointAuthorizationParameter(connection, 'apitoken', false);
    let credentialHandler = getHandlerFromToken(accessToken);
    let vssConnection = new WebApi(endpointUrl, credentialHandler);
    let buildApi = vssConnection.getBuildApi();
    let artifacts = await buildApi.getArtifacts(parseInt(buildId), projectId);

    artifacts.forEach(async function (artifact) {
        if (artifact.resource.type.toLowerCase() === "container") {
            let containerParts: string[] = artifact.resource.data.split('/', 3);
            if (containerParts.length !== 3) {
                throw new Error(tl.loc("FileContainerInvalidArtifactData"));
            }

            let containerId: number = parseInt(containerParts[1]);
            let containerPath: string = containerParts[2];

            var itemsUrl = url.resolve(endpointUrl, "_apis/resources/Containers/" + containerId + "?itemPath=" + containerPath + "&isShallow=true");
            console.log(tl.loc("DownloadArtifacts", itemsUrl));

            var variables = {};
            var webProvider = new providers.WebProvider(itemsUrl, "vsts.handlebars", "", accessToken, variables);

            let downloader = new engine.FetchEngine();
            let downloaderOptions = new engine.FetchEngineOptions();
            await downloader.fetchItems(webProvider, downloadPath, downloaderOptions);
        }
        else if (artifact.resource.type.toLowerCase() === "filepath") {
            // todo: call into robocopy
            throw new Error("Not Supported");
        }
        else {
            throw new Error("Not Supported");
        }
    });

    tl.setResult(tl.TaskResult.Succeeded, "");
}

main()
    .then((result) => tl.setResult(tl.TaskResult.Succeeded, ""))
    .catch((error) => tl.setResult(tl.TaskResult.Failed, error));