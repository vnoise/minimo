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

map "/receive" do
  run OSCServer.new
end

map "/send" do
  run OSCClient.new
end

map "/" do
  run(lambda do |env|
        samples = (Dir.entries('samples') - ['.', '..']).map {|file| file.chomp('.wav') }
        
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
