$:.unshift './lib'
$:.unshift './vendor/rosc-0.1.3/lib'
$:.unshift './vendor/json_pure-1.4.3/lib'

require 'rack'
require 'rack/file'
require 'rack/reloader'

begin
  require 'osc_sender'
  require 'osc_receiver'
  require 'erb'
  require 'instrument_manager'
rescue SyntaxError
  puts $!.message
  puts $!.backtrace
  gets
  exit
end
  
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

map "/" do
  run(lambda do |env|
        $client_id.succ!
        html = ERB.new(File.read('index.html')).result(binding)

        [200, {'Content-Type' => 'text/html'}, html]
      end)
end

map '/javascripts' do
  run Rack::File.new('./javascripts')
end

map '/stylesheets' do
  run Rack::File.new('./stylesheets')
end
