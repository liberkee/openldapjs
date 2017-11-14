{
  'targets': [
    {
      'target_name': 'binding',
      'defines': [ 'V8_DEPRECATION_WARNINGS=1' ],

'conditions': [
      [ 'OS=="win"',{

      

      'include_dirs' : [
        "<!(node -e \"require('nan')\")",
        'C:/users/raribas/Desktop/Libraries/include/openldap', # path to  the prebuilt openldap include
        'C:/users/raribas/Desktop/Libraries/include/openssl', #path to  the prebuilt openssl include
        'C:/users/raribas/Desktop/Libraries/include/sasl', #path to the rebuilt sasl include
      ],
      'sources': [ './src/binding.cc', './src/ldap_control.cc','./src/ldap_bind_progress.cc', './src/ldap_paged_search_progress.cc',
            './src/ldap_search_progress.cc','./src/ldap_add_progress.cc','./src/ldap_delete_progress.cc',
            './src/ldap_modify_progress.cc','./src/ldap_rename_progress.cc','./src/ldap_compare_progress.cc',
            './src/ldap_changePassword_progress.cc', './src/ldap_map_result.cc', './src/ldap_helper_function.cc'],
      'ldflags': [
            '-Wl,-z,defs'
      ],
      'link_settings': {
        'libraries': [
          'libssl.lib',
          'libsasl.lib',
          'libcrypto.lib',
          'olber32_a.lib',
          'oldap32_a.lib',
          'ws2_32.lib'
        ],
        'library_dirs': [
          'C:/Users/raribas/Desktop/Libraries/lib', #path to the prebuilt lib's
          'C:/Users/raribas/Desktop/Libraries/bin' #path to the prebuilt bin
        ],
      },
      'defines': [
          'LDAP_DEPRECATED'
      ],
      'msvs_settings': {
        'VCCLCompilerTool': {
          'AdditionalOptions': [
            '/MD'
          ],
        },
      },
      'cflags': [
          '-Wall',
          '-g',
          '-std=c++11',
          '-Werror',
          '-Wfatal-errors'
          
      ],
      'cflags!': ['-fno-exceptions'],
      'cflags_cc!': ['-fno-exceptions'],
      
    }, { #not windows

     'include_dirs' : [
         "<!(node -e \"require('nan')\")",
        '/usr/local/include'
      ],
      'sources': [ './src/binding.cc', './src/ldap_control.cc','./src/ldap_bind_progress.cc', './src/ldap_paged_search_progress.cc',
            './src/ldap_search_progress.cc','./src/ldap_add_progress.cc','./src/ldap_delete_progress.cc',
            './src/ldap_modify_progress.cc','./src/ldap_rename_progress.cc','./src/ldap_compare_progress.cc',
            './src/ldap_changePassword_progress.cc', './src/ldap_map_result.cc', './src/ldap_helper_function.cc'],
      'ldflags': [
            '-Wl,-z,defs'
      ],
      'libraries': [
         '-lldap_r',
         '-llber'
      ],
      'defines': [
          'LDAP_DEPRECATED'
      ],
      'ldflags': [
          '-L/usr/local/lib'
      ],
      'cflags': [
          '-Wall',
          '-g',
          '-std=c++11',
          '-Werror',
          '-Wfatal-errors'
      ],
      'cflags!': ['-fno-exceptions'],
      'cflags_cc!': ['-fno-exceptions']
    }]
]
    }
  ]
}
  
    

