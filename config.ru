require 'rack'
require 'rack/file'
require 'rack/reloader'
require 'osc_sender'
require 'osc_receiver'
require 'erb'
require 'manager'

use Rack::Reloader

$receiver =  OSCReceiver.new('localhost', 3335)
$sender = OSCSender.new('localhost', 3334)
$manager = InstrumentManager.new

$client_id = '1'

map "/receive" do
  run $receiver
end

map "/send" do
  run $sender
end

map "/index" do
  run(lambda do |env|
        $client_id.succ!
        html = ERB.new(File.read('index.html')).result(binding)

        [200, {'Content-Type' => 'text/html'}, html]
      end)
end

map '/' do
  run Rack::File.new('.')
end
