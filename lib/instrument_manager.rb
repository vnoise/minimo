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

    @instruments.each do |instrument|
      instrument.send_updates
    end
  end

  def saves
    (Dir.entries('saves') - ['.', '..']).map {|file| file.chomp('.yml') }
  end

  def handle(sender_id, type, *args)
    case type
    when 'load'
      open("saves/#{args.first}.yml", "rb") do |io|
        @instruments = Marshal.load(io.read)
      end

      @instruments.each do |instrument|
        instrument.send_updates
      end

    when 'save'
      index = (saves.max || '0').succ
      open("saves/#{index}.yml", "wb") {|io| io << Marshal.dump(@instruments) }

    else
      @instruments[args.first.to_i].handle(sender_id, type, args[1..-1])
    end
  end

  def constructor_messages
    messages = []

    @instruments.each do |instrument|
      messages += instrument.constructor_messages
    end

    messages
  end
end
