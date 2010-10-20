$:.unshift './lib'
$:.unshift './vendor/rosc-0.1.3/lib'
$:.unshift './vendor/json_pure-1.4.3/lib'

require 'rack'
require 'rack/file'
require 'rack/reloader'

require 'erb'
require 'osc_manager'
require 'instrument_manager'
  
use Rack::Reloader

$osc = OSCManager.new
$manager = InstrumentManager.new
$manager.create

$client_id = '1'

map "/receive" do
  run $osc
end

map "/send" do
  run $manager
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
