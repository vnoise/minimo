require 'message'
require 'slider'
require 'instrument'

class InstrumentManager

  attr_reader :instruments

  def initialize
    @instruments = []

    4.times do |index| 
      @instruments << Instrument.new(index)
    end

    sleep 0.5

    @instruments.each do |instrument|
      instrument.send_updates
    end
  end

  def saves
    (Dir.entries('saves') - ['.', '..']).map {|file| file.chomp('.yml') }
  end

  def call(env)
    sender_id, type, *args = env['PATH_INFO'].split('/')[1..-1]

    handle(sender_id, type, *args)

    [200, {'Content-Type' => 'text/html'}, "OK"]
  end

  def handle(sender_id, type, *args)
    case type      
    when 'load'
      open("saves/#{args.first}", "rb") do |io|
        @instruments = Marshal.load(io.read)
      end

      @instruments.each do |instrument|
        instrument.send_updates
      end

    when 'save'
      index = (saves.max || '0').succ
      open("saves/#{index}", "wb") {|io| io << Marshal.dump(@instruments) }

    else
      @instruments[args.first.to_i].handle(sender_id, type, args[1..-1])
    end
  end

  def constructor_messages
    @instruments.inject([]) {|list, i| list + i.constructor_messages }
  end
end
