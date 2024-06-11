import { AppConfig } from '/imports/startup/config';
import http from 'http'

export function configureRoute(config) {
	console.log(`Routing /${config.bucketName}/`);
		Router.route(`/${config.bucketName}/:filename`, function(a, b) {
			const client_response = this.response;
			const path = `${config.bucketName}/${this.params.filename}`
			const options = {
				hostname: AppConfig.gcsHostname,
				port: 80,
				path: path,
				method: this.request.method,
				headers: this.request.headers,
			};

			const proxy = http.request(options, function(res) {
				client_response.writeHead(res.statusCode, res.headers);
				res.pipe(client_response, {
					end: true,
				});
			});

			this.request.pipe(proxy, {
				end: true,
			});
		}, {where: 'server'})
}