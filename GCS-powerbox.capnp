# GCS-powerbox.capnp

#### INCORRECT >>> @0x9759ad011d40ab4c;  # generated using `capnp id`

using Powerbox = import "/sandstorm/powerbox.capnp";
using ApiSession = import "/sandstorm/api-session.capnp".ApiSession;

# We're constructing a PowerboxDescriptor for an HTTP API, which uses the
# ApiSession interface. Hence, our descriptor will have one tag. The tag's
# ID is the Cap'n Proto type ID for `ApiSession` (as declared in
# api-session.capnp using the @-sign after the type name). The tag's value
# is a struct of type `ApiSession.PowerboxTag`, since `ApiSession` documents
# that this is the appropriate tag value type to use when requesting an
# `ApiSession`.

const GCSTagValue :ApiSession.PowerboxTag = (
  canonicalUrl = "https://storage.googleapis.com/",
  # We're requesting an API compatible with Google CloudServices. This request will cover all versions,
  # which is overkill, but overkill is the best kind of kill.
);

const myDescriptor :Powerbox.PowerboxDescriptor = (
  # Our descriptor has one tag, whose ID is `ApiSession`'s type ID, and
  # whose value is the tag value defined above.
  tags = [
    (id = 0xc879e379c625cdc7, value = .GCSTagValue)
  ],
);