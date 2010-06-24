# -*- encoding: utf-8 -*-

Gem::Specification.new do |s|
  s.name = %q{rosc}
  s.version = "0.1.3"

  s.required_rubygems_version = Gem::Requirement.new(">= 1.2") if s.respond_to? :required_rubygems_version=
  s.authors = [""]
  s.date = %q{2009-12-13}
  s.description = %q{}
  s.email = %q{}
  s.extra_rdoc_files = ["CHANGELOG", "LICENSE", "README", "TODO", "lib/osc.rb", "lib/osc/pattern.rb", "lib/osc/server.rb", "lib/osc/transport.rb", "lib/osc/udp.rb"]
  s.files = ["AUTHORS", "CHANGELOG", "GPL.txt", "LICENSE", "README", "Rakefile", "TODO", "examples/readme.rb", "lib/osc.rb", "lib/osc/pattern.rb", "lib/osc/server.rb", "lib/osc/transport.rb", "lib/osc/udp.rb", "setup.rb", "test/test_osc.rb", "Manifest", "rosc.gemspec"]
  s.homepage = %q{}
  s.rdoc_options = ["--line-numbers", "--inline-source", "--title", "Rosc", "--main", "README"]
  s.require_paths = ["lib"]
  s.rubyforge_project = %q{rosc}
  s.rubygems_version = %q{1.3.5}
  s.summary = %q{}
  s.test_files = ["test/test_osc.rb"]

  if s.respond_to? :specification_version then
    current_version = Gem::Specification::CURRENT_SPECIFICATION_VERSION
    s.specification_version = 3

    if Gem::Version.new(Gem::RubyGemsVersion) >= Gem::Version.new('1.2.0') then
    else
    end
  else
  end
end
