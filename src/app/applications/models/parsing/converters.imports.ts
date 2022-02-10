/**
 * This file defines the imports of the converters and imports them so that the @Converter annotation can be executed. This allows this single file to be imported 
 * and execute all the annotations at once. This file should then be imported by clients so that the converters are transparent. I.e. through the use of the @Converter
 * annotation and this file, the only place a converter file should be imported is here, and then the client that requires converter functionality through the Converters.get()
 * method, should import this file
 */
import './sectionconverter';
import './containerconverter';
import './textconverter';
import './textquestionconverter';
import './selectquestionconverter';
import './signaturequestionconverter';
import './checkboxgroupconverter';
import './checkboxquestionconverter';
import './radioquestionconverter';
import './multipartquestionconverter';
import './questiontableconverter';