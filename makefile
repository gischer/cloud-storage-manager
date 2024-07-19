gcsDescriptor:
	capnp eval -I/opt/sandstorm/latest/usr/include -p GCS-powerbox.capnp gcsCloudStorageDescriptor | base64 -w0