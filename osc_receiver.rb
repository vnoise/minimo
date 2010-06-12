require 'osc'
require 'thread'
require 'json'
require 'queue'

class OSCReceiver

  def initialize(host, port)
    @host = host
    @port = port
    @queues = {}

    @server = OSC::UDPServer.new
    @server.bind(@host, @port)
    @server.add_method '/*', nil do |message|
      broadcast(message)
    end

    Thread.new do
      @server.serve
    end
  end

  def broadcast(message, client_id = nil)
    # puts "#{message.address} #{message.args.inspect}"
    @queues.each do |id, queue|
      unless id == client_id
        queue.push({ :address => message.address, :args => message.args })
      end
    end
  end
  
  def call(env)
    client_id = env['PATH_INFO'][1..-1]

    queue = (@queues[client_id] ||= TQueue.new)
    messages = queue.wait
  
    [200, {'Content-Type' => 'text/html'}, messages.to_json]
  end
end
  
